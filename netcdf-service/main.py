from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import xarray as xr
import numpy as np
from PIL import Image
import matplotlib.colors as mcolors
import io
from typing import Dict, Optional, Tuple, List
import threading
import sqlite3
from pathlib import Path
import matplotlib.cm as cm
from scipy.interpolate import RegularGridInterpolator
import pandas as pd
import glob
import os
import psycopg
import json
from contextlib import contextmanager
from environs import Env
import os


from helpers import tile_lonlat_grid, TILE_SIZE, get_panoply_colormap

app = FastAPI()

env = Env()
env.read_env()

DATASET_CACHE: Dict[str, Tuple[xr.Dataset, float]] = {}
STATS_CACHE: Dict[str, Dict[str, Tuple[float, float]]] = {}
CACHE_LOCK = threading.RLock()
MAX_CACHE_SIZE = 3
CACHE_TTL = 300
DB_DSN = os.environ.get('DB_URL')

datasets = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@contextmanager
def get_conn():
    with psycopg.connect(DB_DSN) as conn:
        yield conn


def init_database():
    with get_conn() as conn:
        with conn.cursor() as cur:

            cur.execute("""
            CREATE TABLE IF NOT EXISTS datasets (
                id BIGSERIAL PRIMARY KEY,
                file_path TEXT UNIQUE NOT NULL,
                file_name TEXT NOT NULL,
                dataset_type TEXT NOT NULL,
                dataset_time TIMESTAMP NOT NULL,
                file_size BIGINT NOT NULL,
                last_modified DOUBLE PRECISION NOT NULL,
                variable_count INTEGER,
                variables JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)

            cur.execute("""
            CREATE TABLE IF NOT EXISTS dataset_times (
                id BIGSERIAL PRIMARY KEY,
                dataset_id BIGINT REFERENCES datasets(id) ON DELETE CASCADE,
                time_value TIMESTAMP NOT NULL,
                time_index INTEGER NOT NULL
            )
            """)

            cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_dataset_type_time
            ON datasets(dataset_type, dataset_time)
            """)

            cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_dataset_times_dataset_time
            ON dataset_times(dataset_id, time_value)
            """)


def extract_dataset_info(
    file_path: str
) -> Tuple[Optional[str], Optional[pd.Timestamp], List[str], List[pd.Timestamp]]:
    """Извлекает информацию о датасете из NetCDF файла"""

    try:
        with xr.open_dataset(file_path, engine="netcdf4", decode_times=False) as ds:
            file_name = Path(file_path).name.lower()

            if 'era5' in file_name:
                dataset_type = 'era5'
            elif 'carra' in file_name:
                dataset_type = 'carra'
            else:
                dataset_type = 'unknown'

            # --- Декодируем CF-время один раз ---
            ds_decoded = xr.decode_cf(ds, decode_times=True)

            time_values: List[pd.Timestamp] = []

            # --- Универсальная обработка time / valid_time ---
            if 'time' in ds_decoded.coords:
                time_values = pd.to_datetime(ds_decoded.time.values).to_list()

            elif 'valid_time' in ds_decoded.coords:
                time_values = pd.to_datetime(
                    ds_decoded.valid_time.values
                ).to_list()

            # --- fallback: дата из имени файла ---
            if not time_values:
                import re
                match = re.search(
                    r'(\d{4})[_-]?(\d{2})[_-]?(\d{2})', file_name)
                if match:
                    y, m, d = match.groups()
                    time_values = [pd.Timestamp(f"{y}-{m}-{d}")]

            # --- fallback: mtime ---
            if not time_values:
                stat = os.stat(file_path)
                time_values = [pd.Timestamp.fromtimestamp(stat.st_mtime)]
                print(f"⚠ Используется mtime для {Path(file_path).name}")

            dataset_time = time_values[0]  # репрезентативное

            variables = list(ds.data_vars.keys())

            return dataset_type, dataset_time, variables, time_values

    except Exception as e:
        print(f"⚠ Ошибка при чтении {file_path}: {e}")
        import traceback
        traceback.print_exc()
        return None, None, [], []


def update_database_index():
    nc_files = glob.glob('./data/*.nc')

    with get_conn() as conn:
        with conn.cursor() as cur:

            for file_path in nc_files:
                file_path = str(Path(file_path).resolve())
                stat = os.stat(file_path)

                cur.execute(
                    "SELECT id, last_modified FROM datasets WHERE file_path=%s",
                    (file_path,)
                )

                row = cur.fetchone()

                if row and abs(row[1] - stat.st_mtime) < 1:
                    continue

                dataset_type, dataset_time, variables, times = extract_dataset_info(
                    file_path)

                if dataset_time is None:
                    continue

                variables_json = json.dumps(variables)

                if row:
                    dataset_id = row[0]

                    cur.execute("""
                        UPDATE datasets
                        SET dataset_type=%s,
                            dataset_time=%s,
                            file_size=%s,
                            last_modified=%s,
                            variable_count=%s,
                            variables=%s
                        WHERE id=%s
                    """, (
                        dataset_type,
                        dataset_time,
                        stat.st_size,
                        stat.st_mtime,
                        len(variables),
                        variables_json,
                        dataset_id
                    ))

                    cur.execute(
                        "DELETE FROM dataset_times WHERE dataset_id=%s",
                        (dataset_id,)
                    )

                else:
                    cur.execute("""
                        INSERT INTO datasets
                        (file_path, file_name, dataset_type, dataset_time,
                         file_size, last_modified, variable_count, variables)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                        RETURNING id
                    """, (
                        file_path,
                        Path(file_path).name,
                        dataset_type,
                        dataset_time,
                        stat.st_size,
                        stat.st_mtime,
                        len(variables),
                        variables_json
                    ))

                    dataset_id = cur.fetchone()[0]

                for i, t in enumerate(times):
                    cur.execute("""
                        INSERT INTO dataset_times(dataset_id, time_value, time_index)
                        VALUES (%s,%s,%s)
                    """, (dataset_id, t, i))


def find_matching_dataset_by_time(pmc_time, dataset_type="era5", time_tolerance_hours=3):

    with get_conn() as conn:
        with conn.cursor() as cur:

            cur.execute("""
                SELECT file_path, dataset_time
                FROM datasets
                WHERE dataset_type=%s
                ORDER BY ABS(EXTRACT(EPOCH FROM (dataset_time - %s)))
                LIMIT 1
            """, (dataset_type, pmc_time))

            row = cur.fetchone()

            if row:
                file_path, file_time = row
                diff = abs((pmc_time - file_time).total_seconds() / 3600)

                if diff <= time_tolerance_hours:
                    return file_path, file_time, diff

    return find_in_times_table(pmc_time, dataset_type, time_tolerance_hours)


def find_in_times_table(pmc_time, dataset_type="era5", time_tolerance_hours=3):

    with get_conn() as conn:
        with conn.cursor() as cur:

            cur.execute("""
                SELECT d.file_path, dt.time_value
                FROM datasets d
                JOIN dataset_times dt ON d.id = dt.dataset_id
                WHERE d.dataset_type=%s
            """, (dataset_type,))

            best = None
            best_diff = 1e9

            for file_path, file_time in cur.fetchall():
                diff = abs((pmc_time - file_time).total_seconds() / 3600)

                if diff <= time_tolerance_hours and diff < best_diff:
                    best = (file_path, file_time)
                    best_diff = diff

            if best:
                return best[0], best[1], best_diff

    return None


@app.on_event("startup")
async def startup_event():
    """Инициализация при запуске"""

    try:
        init_database()
        update_database_index()

        with get_conn() as conn:
            with conn.cursor() as cur:

                cur.execute("SELECT COUNT(*) FROM datasets")
                total_files = cur.fetchone()[0]

                cur.execute(
                    "SELECT COUNT(DISTINCT dataset_type) FROM datasets")
                types_count = cur.fetchone()[0]

                cur.execute("""
                    SELECT dataset_type, COUNT(*)
                    FROM datasets
                    GROUP BY dataset_type
                """)
                type_stats = cur.fetchall()

        print(f"Всего файлов: {total_files}")
        print(f"Типов данных: {types_count}")

        for dtype, count in type_stats:
            print(f"{dtype}: {count}")

    except Exception as e:
        print(f"Ошибка при инициализации: {e}")
        import traceback
        traceback.print_exc()


def open_nc_with_stats(dataset_path: str, variable: str) -> Tuple[xr.Dataset, float, float]:
    """Открывает датасет и вычисляет статистики с кэшированием"""

    cache_key = f"{dataset_path}:{variable}"
    if cache_key in STATS_CACHE:
        vmin, vmax = STATS_CACHE[cache_key]
        dataset = get_cached_dataset(dataset_path)
        return dataset, vmin, vmax

    dataset = get_cached_dataset(dataset_path)
    arr = dataset[variable].values

    if arr.ndim == 3:
        arr = arr[0]

    valid = arr[~np.isnan(arr)]

    if len(valid) == 0:
        vmin = vmax = 0.0
    else:
        vmin = np.percentile(valid, 2)
        vmax = np.percentile(valid, 98)

    STATS_CACHE[cache_key] = (float(vmin), float(vmax))

    return dataset, float(vmin), float(vmax)


def open_nc_dataset(path: str) -> xr.Dataset:
    """Open NetCDF dataset with lazy loading."""
    path = str(Path(path).resolve())

    ds = xr.open_dataset(
        path,
        engine="netcdf4",
        chunks={},
        cache=False
    )

    return ds


def safely_load_nc_files():
    """
    Безопасная загрузка .nc файлов с правильным управлением ресурсами
    """
    nc_files = glob.glob('./data/*.nc')
    print("Безопасная загрузка .nc файлов:")

    datasets = {}
    for file in nc_files:
        try:
            with xr.open_dataset(file) as ds:
                ds_loaded = ds.load()
                datasets[file] = ds_loaded
                print(f"✓ {file}:")
                print(f"  Переменные: {list(ds_loaded.variables.keys())}")
                if 'time' in ds_loaded.dims:
                    print(f"  Время: {ds_loaded.time.values[0]}")
                print()

        except PermissionError as e:
            print(f"✗ Ошибка доступа к {file}: {e}")
            print("  Закройте файл в других программах (например, NetCDF viewer)")
        except Exception as e:
            print(f"✗ Ошибка загрузки {file}: {e}")

    return datasets


def find_matching_dataset(pmc_time, datasets, time_tolerance_hours=3, type="era5"):
    """
    Улучшенная функция поиска подходящего dataset по времени
    """
    best_match = None
    min_time_diff = float('inf')

    for filename, ds in datasets.items():
        print(f"  Проверка файла: {filename}")

        ds_time = None

        if type in filename and 'single' not in filename:
            if 'time' in ds.coords:
                ds_time = pd.to_datetime(
                    ds.time.values[0]) if ds.time.size > 0 else None
                print(f"    Время из 'time': {ds_time}")

            elif 'valid_time' in ds.coords:
                ds_time = pd.to_datetime(
                    ds.valid_time.values[0]) if ds.valid_time.size > 0 else None
                print(f"    Время из 'valid_time': {ds_time}")

            if ds_time is not None:
                time_diff = abs((pmc_time - ds_time).total_seconds() / 3600)
                print(f"    Разница с ПМЦ: {time_diff:.2f} часов")

                if time_diff <= time_tolerance_hours and time_diff < min_time_diff:
                    min_time_diff = time_diff
                    best_match = (filename, ds, time_diff)
                    # print(
                    #     f"    ✓ Подходит! Новая минимальная разница: {time_diff:.2f} часов")

    return best_match


def open_nc_dataset(path: str) -> xr.Dataset:
    """
    Open NetCDF dataset with caching.

    ✔ opened only once
    ✔ reused across requests
    ✔ lazy (does not load whole file)
    ✔ safe for FastAPI tile servers

    Parameters
    ----------
    path : str
        Path to .nc file

    Returns
    -------
    xr.Dataset
    """

    path = str(Path(path).resolve())

    ds = xr.open_dataset(
        path,
        engine="netcdf4",      # fastest for most cases
        chunks={},             # lazy loading (important)
        cache=True
    )

    return ds


def get_cached_dataset(path):
    if path not in DATASET_CACHE:
        DATASET_CACHE[path] = open_nc_dataset(path)
    return DATASET_CACHE[path]


def get_tile_data(dataset, variable, x, y, z, time_idx=0, level_index=0):
    ds = dataset
    var = ds[variable]

    if 'pressure_level' in var.dims:
        data = var.isel(valid_time=time_idx, pressure_level=level_index).values
        actual_level = var.pressure_level.values[level_index]
        print(
            f"  get_tile_data: using level index {level_index} = {actual_level} hPa")
    else:
        if 'valid_time' in var.dims:
            data = var.isel(valid_time=time_idx).values
        else:
            data = var.values

    print(f"\nData shape before processing: {data.shape}")

    if data.ndim != 2:
        print(f"Reshaping from {data.ndim}D to 2D")
        data = data.squeeze()
        if data.ndim != 2:
            print(f"  Still not 2D, shape: {data.shape}")
            data = data.reshape(-1, data.shape[-2], data.shape[-1])[0]
            print(f"  After reshape: {data.shape}")

    lats = var.latitude.values
    lons = var.longitude.values

    print(
        f"\nLatitudes: {len(lats)} points from {lats.min():.2f} to {lats.max():.2f}")
    print(
        f"Longitudes: {len(lons)} points from {lons.min():.2f} to {lons.max():.2f}")
    print(f"Data final shape: {data.shape}")

    # ---- ensure ascending ----
    if lats[0] > lats[-1]:
        lats = lats[::-1]
        data = data[::-1, :]

    if lons[0] > lons[-1]:
        lons = lons[::-1]
        data = data[:, ::-1]

    # ---- build interpolator ----
    try:
        interp = RegularGridInterpolator(
            (lats, lons),
            data,
            method="nearest",
            bounds_error=False,
            fill_value=np.nan
        )

        lon_grid, lat_grid = tile_lonlat_grid(z, x, y)

        pts = np.stack([lat_grid.ravel(), lon_grid.ravel()], axis=-1)
        tile = interp(pts).reshape(256, 256)

        return tile

    except Exception as e:
        print(f"ERROR: {e}")
        raise


# variable: str, t: int = 0

@app.get("/tile/{z}/{x}/{y}")
def tile(variable: str, time: str, z: int, x: int, y: int, pressure_level: int = 850):
    time = pd.to_datetime(time, format='%m/%d/%Y %H:%M')
    ds_file = find_matching_dataset_by_time(
        time, dataset_type="era5", time_tolerance_hours=1)

    if ds_file is None or variable is None:
        return Response()

    filename, dataset, time_diff = ds_file

    ds, global_vmin, global_vmax = open_nc_with_stats(filename, variable)

    var = ds[variable]

    times = var.valid_time.values
    time_index = 0

    for i, time_val in enumerate(times):
        time_val = pd.to_datetime(time_val, format='%m/%d/%Y %H:%M')
        time_diff = abs((time_val - time).total_seconds() / 3600)
        if time_diff <= 1:
            time_index = i
            print(f"✓ Found {time} at index {i}")
            break

    if variable == 'wind_speed' or variable == 'u' or variable == 'v':
        var = ds[variable]
        if 'u' in ds and 'v' in ds and 'pressure_level' in var.dims:
            levels = var.pressure_level.values
            level_index = None

            for i, level in enumerate(levels):
                if float(level) == float(pressure_level):
                    level_index = i
                    print(f"✓ Found {pressure_level} hPa at index {i}")
                    break

            if level_index is None:
                level_index = np.argmin(
                    np.abs(levels.astype(float) - float(pressure_level)))
                print(
                    f"! Using closest: index {level_index}, level {levels[level_index]} hPa")

            u_data = get_tile_data(
                ds, 'u', x, y, z, time_idx=time_index, level_index=level_index)
            v_data = get_tile_data(
                ds, 'v', x, y, z, time_idx=time_index, level_index=level_index)

            tile_data = np.sqrt(u_data**2 + v_data**2)

            if 'valid_time' in ds['u'].dims:
                u_global = ds['u'].isel(valid_time=time_index).values
                v_global = ds['v'].isel(valid_time=time_index).values
            else:
                u_global = ds['u'].values
                v_global = ds['v'].values

            wind_global = np.sqrt(u_global**2 + v_global**2)
            vmin = np.nanpercentile(wind_global, 2)
            vmax = np.nanpercentile(wind_global, 98)

            cmap = get_panoply_colormap("NEO_modis_sst_45")
        else:
            tile_data = get_tile_data(ds, variable, x, y, z, time_idx=0)
            vmin, vmax = global_vmin, global_vmax
            cmap = get_panoply_colormap("NEO_modis_sst_45")

    if variable == 'u10' or variable == 'v10':
        var = ds[variable]
        if 'u10' in ds and 'v10' in ds:

            u_data = get_tile_data(
                ds, 'u', x, y, z, time_idx=time_index)
            v_data = get_tile_data(
                ds, 'v', x, y, z, time_idx=time_index)

            tile_data = np.sqrt(u_data**2 + v_data**2)

            if 'valid_time' in ds['u'].dims:
                u_global = ds['u'].isel(valid_time=time_index).values
                v_global = ds['v'].isel(valid_time=time_index).values
            else:
                u_global = ds['u'].values
                v_global = ds['v'].values

            wind_global = np.sqrt(u_global**2 + v_global**2)
            vmin = np.nanpercentile(wind_global, 2)
            vmax = np.nanpercentile(wind_global, 98)

            cmap = get_panoply_colormap("NEO_modis_sst_45")
        else:
            tile_data = get_tile_data(ds, variable, x, y, z, time_idx=0)
            vmin, vmax = global_vmin, global_vmax
            cmap = get_panoply_colormap("NEO_modis_sst_45")

    elif variable == 'z':
        var = ds[variable]

        if 'pressure_level' in var.dims:
            levels = var.pressure_level.values
            level_index = None

            for i, level in enumerate(levels):
                if float(level) == float(pressure_level):
                    level_index = i
                    print(f"✓ Found {pressure_level} hPa at index {i}")
                    break

            if level_index is None:
                level_index = np.argmin(
                    np.abs(levels.astype(float) - float(pressure_level)))
                print(
                    f"! Using closest: index {level_index}, level {levels[level_index]} hPa")

            tile_data = get_tile_data(
                ds, variable, x, y, z, time_idx=time_index, level_index=level_index)

            if 'valid_time' in var.dims:
                level_data = var.isel(
                    valid_time=time_index, pressure_level=level_index).values
            else:
                level_data = var.isel(pressure_level=level_index).values

            vmin = np.nanpercentile(level_data, 2)
            vmax = np.nanpercentile(level_data, 98)

            print(
                f"Geopotential at {pressure_level}hPa: {vmin:.2f} - {vmax:.2f}")
            cmap = get_panoply_colormap("NEO_modis_sst_45")
        else:
            tile_data = get_tile_data(
                ds, variable, x, y, z, time_idx=time_index)
            vmin, vmax = global_vmin, global_vmax
            cmap = get_panoply_colormap("NEO_modis_sst_45")

    mask = np.isnan(tile_data)

    if mask.all():
        img = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    else:

        norm = (tile_data - vmin) / (vmax - vmin)
        norm = np.clip(norm, 0, 0.999)

        n_levels = len(cmap.colors)
        color_indices = np.floor(norm * n_levels).astype(int)
        color_indices = np.clip(color_indices, 0, n_levels - 1)

        h, w = tile_data.shape
        rgba = np.zeros((h, w, 4), dtype=np.uint8)

        for i in range(n_levels):
            mask_level = (color_indices == i)
            if np.any(mask_level):
                color = mcolors.to_rgba(cmap.colors[i])
                rgba[mask_level] = np.array(color) * 255

        rgba[..., 3] = (~mask) * 255
        img = Image.fromarray(rgba, "RGBA")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(buf.getvalue(), media_type="image/png")
