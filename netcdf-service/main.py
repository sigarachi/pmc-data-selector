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

from helpers import tile_lonlat_grid, TILE_SIZE, get_panoply_colormap

app = FastAPI()

DATASET_CACHE: Dict[str, Tuple[xr.Dataset, float]] = {}
STATS_CACHE: Dict[str, Dict[str, Tuple[float, float]]] = {}
CACHE_LOCK = threading.RLock()
MAX_CACHE_SIZE = 3
CACHE_TTL = 300

DB_PATH = Path("./data/datasets_index.db")

datasets = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_database():
    """Инициализирует базу данных и создает таблицы если их нет"""
    try:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)

        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()

        # Создаем таблицу для индексации файлов
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS datasets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT UNIQUE NOT NULL,
                file_name TEXT NOT NULL,
                dataset_type TEXT NOT NULL,
                dataset_time TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                last_modified REAL NOT NULL,
                variable_count INTEGER,
                variables TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Создаем таблицу для временных меток
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS dataset_times (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataset_id INTEGER NOT NULL,
                time_value TEXT NOT NULL,
                time_index INTEGER NOT NULL,
                FOREIGN KEY (dataset_id) REFERENCES datasets (id) ON DELETE CASCADE
            )
        """)

        # Создаем индексы отдельно от создания таблиц
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_dataset_type_time 
            ON datasets (dataset_type, dataset_time)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_dataset_file_path 
            ON datasets (file_path)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_dataset_times_dataset_time 
            ON dataset_times (dataset_id, time_value)
        """)

        conn.commit()
        conn.close()

    except Exception as e:
        print(f"Ошибка инициализации базы данных: {e}")
        import traceback
        traceback.print_exc()


def extract_dataset_info(file_path: str) -> Tuple[Optional[str], Optional[pd.Timestamp], List[str], List[str]]:
    """Извлекает информацию о датасете из NetCDF файла"""
    try:
        with xr.open_dataset(file_path, engine="netcdf4", decode_times=False) as ds:
            # Определяем тип датасета по имени файла
            file_name = Path(file_path).name.lower()
            if 'era5' in file_name:
                dataset_type = 'era5'
            elif 'carra' in file_name:
                dataset_type = 'carra'
            else:
                dataset_type = 'unknown'

            # Извлекаем время
            dataset_time = None
            times = []

            # Пробуем разные способы получения времени
            if 'time' in ds.coords:
                time_var = ds.time
                if time_var.size > 0:
                    try:
                        # Способ 1: Пробуем декодировать с явным указанием decode_times=True
                        ds_decoded = xr.decode_cf(ds, decode_times=True)
                        dataset_time = pd.to_datetime(
                            ds_decoded.time.values[0])

                        # Если есть несколько временных срезов
                        if time_var.size > 1:
                            for i in range(min(time_var.size, 10)):
                                time_val = pd.to_datetime(
                                    ds_decoded.time.values[i])
                                times.append(str(time_val))
                    except:
                        try:
                            # Способ 2: Пробуем напрямую через pandas
                            time_vals = pd.to_datetime(time_var.values)
                            dataset_time = time_vals[0]
                            if len(time_vals) > 1:
                                for i in range(min(len(time_vals), 10)):
                                    times.append(str(time_vals[i]))
                        except:
                            try:
                                # Способ 3: Пробуем парсить атрибуты времени
                                if hasattr(time_var, 'units'):
                                    units = time_var.units
                                    if 'hours since' in units or 'days since' in units:
                                        try:
                                            ref_date = pd.to_datetime(
                                                units.split('since')[1].strip())
                                            if 'hours' in units:
                                                hours_offset = float(
                                                    time_var.values[0])
                                                dataset_time = ref_date + \
                                                    pd.Timedelta(
                                                        hours=hours_offset)
                                            elif 'days' in units:
                                                days_offset = float(
                                                    time_var.values[0])
                                                dataset_time = ref_date + \
                                                    pd.Timedelta(
                                                        days=days_offset)
                                        except:
                                            pass
                            except:
                                pass

            elif 'valid_time' in ds.coords:
                time_var = ds.valid_time
                if time_var.size > 0:
                    try:
                        ds_decoded = xr.decode_cf(ds, decode_times=True)
                        dataset_time = pd.to_datetime(
                            ds_decoded.valid_time.values[0])
                    except:
                        try:
                            time_vals = pd.to_datetime(time_var.values)
                            dataset_time = time_vals[0]
                        except:
                            pass

            # Если не удалось получить время, пробуем извлечь из имени файла
            if dataset_time is None:
                # Пробуем найти дату в имени файла (например: ERA5_20240101.nc)
                import re
                date_pattern = r'(\d{4})[_-]?(\d{2})[_-]?(\d{2})'
                match = re.search(date_pattern, file_name)
                if match:
                    year, month, day = match.groups()
                    try:
                        dataset_time = pd.Timestamp(f"{year}-{month}-{day}")
                    except:
                        dataset_time = pd.Timestamp(f"{year}-{month}-01")

            # Если все еще None, используем время модификации файла как fallback
            if dataset_time is None:
                file_stat = os.stat(file_path)
                dataset_time = pd.Timestamp.fromtimestamp(file_stat.st_mtime)
                print(
                    f"⚠ Используется время модификации файла для {Path(file_path).name}")

            # Получаем список переменных
            variables = list(ds.data_vars.keys())

            return dataset_type, dataset_time, variables, times

    except Exception as e:
        print(f"⚠ Ошибка при чтении {file_path}: {e}")
        import traceback
        traceback.print_exc()
        return None, None, [], []


def update_database_index():
    """Обновляет индекс файлов в базе данных"""
    try:
        nc_files = glob.glob('./data/*.nc')

        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()

        indexed_count = 0
        updated_count = 0

        for file_path in nc_files:
            file_path = str(Path(file_path).resolve())
            file_stat = os.stat(file_path)

            cursor.execute(
                "SELECT id, last_modified FROM datasets WHERE file_path = ?",
                (file_path,)
            )
            result = cursor.fetchone()

            if result and abs(result[1] - file_stat.st_mtime) < 1:
                continue

            dataset_type, dataset_time, variables, times = extract_dataset_info(
                file_path)

            if dataset_time is None:
                print(f"Не удалось извлечь время из {Path(file_path).name}")
                continue

            variables_json = '[' + ','.join(f'"{v}"' for v in variables) + ']'

            if result:
                dataset_id = result[0]
                cursor.execute("""
                    UPDATE datasets 
                    SET dataset_type = ?, dataset_time = ?, 
                        file_size = ?, last_modified = ?,
                        variable_count = ?, variables = ?
                    WHERE id = ?
                """, (
                    dataset_type,
                    dataset_time.isoformat(),
                    file_stat.st_size,
                    file_stat.st_mtime,
                    len(variables),
                    variables_json,
                    dataset_id
                ))

                cursor.execute(
                    "DELETE FROM dataset_times WHERE dataset_id = ?", (dataset_id,))
                updated_count += 1
            else:
                cursor.execute("""
                    INSERT INTO datasets 
                    (file_path, file_name, dataset_type, dataset_time, 
                     file_size, last_modified, variable_count, variables)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    file_path,
                    Path(file_path).name,
                    dataset_type,
                    dataset_time.isoformat(),
                    file_stat.st_size,
                    file_stat.st_mtime,
                    len(variables),
                    variables_json
                ))
                dataset_id = cursor.lastrowid
                indexed_count += 1

            for i, time_str in enumerate(times):
                cursor.execute("""
                    INSERT INTO dataset_times (dataset_id, time_value, time_index)
                    VALUES (?, ?, ?)
                """, (dataset_id, time_str, i))

        conn.commit()
        conn.close()

    except Exception as e:
        print(f"Ошибка индексации: {e}")
        import traceback
        traceback.print_exc()


def find_matching_dataset_by_time(pmc_time: pd.Timestamp,
                                  dataset_type: str = "era5",
                                  time_tolerance_hours: float = 3) -> Optional[Tuple[str, pd.Timestamp, float]]:
    try:
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT file_path, dataset_time 
            FROM datasets 
            WHERE dataset_type = ?
            ORDER BY file_name
        """, (dataset_type,))

        best_match = None
        min_time_diff = float('inf')

        for row in cursor.fetchall():
            try:
                file_time = pd.to_datetime(row['dataset_time'])
                time_diff = abs((pmc_time - file_time).total_seconds() / 3600)

                if time_diff <= time_tolerance_hours and time_diff < min_time_diff:
                    min_time_diff = time_diff
                    best_match = (row['file_path'], file_time)

            except Exception as e:
                continue

        conn.close()

        if best_match:
            return (best_match[0], best_match[1], min_time_diff)

        return find_in_times_table(pmc_time, dataset_type, time_tolerance_hours)

    except Exception as e:
        print(f"Ошибка поиска в базе данных: {e}")
        return None


def find_in_times_table(pmc_time: pd.Timestamp,
                        dataset_type: str = "era5",
                        time_tolerance_hours: float = 3) -> Optional[Tuple[str, pd.Timestamp, float]]:
    try:
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT d.file_path, dt.time_value
            FROM datasets d
            JOIN dataset_times dt ON d.id = dt.dataset_id
            WHERE d.dataset_type = ?
            ORDER BY dt.time_index
        """, (dataset_type,))

        best_match = None
        min_time_diff = float('inf')

        for row in cursor.fetchall():
            try:
                file_time = pd.to_datetime(row['time_value'])
                time_diff = abs((pmc_time - file_time).total_seconds() / 3600)

                if time_diff <= time_tolerance_hours and time_diff < min_time_diff:
                    min_time_diff = time_diff
                    best_match = (row['file_path'], file_time)

            except Exception as e:
                continue

        conn.close()

        if best_match:
            return (best_match[0], best_match[1], min_time_diff)

        return None

    except Exception as e:
        print(f"Ошибка поиска во временных метках: {e}")
        return None


@app.on_event("startup")
async def startup_event():
    """Инициализация при запуске"""
    try:
        init_database()

        update_database_index()

        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM datasets")
        total_files = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT dataset_type) FROM datasets")
        types_count = cursor.fetchone()[0]

        cursor.execute("""
            SELECT dataset_type, COUNT(*) as count 
            FROM datasets 
            GROUP BY dataset_type
        """)
        type_stats = cursor.fetchall()

        conn.close()

        print(f"Всего файлов: {total_files}")
        print(f"Типов данных: {types_count}")

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
            method="linear",
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
        time, dataset_type="era5", time_tolerance_hours=2)

    if ds_file is None:
        return Response()

    filename, dataset, time_diff = ds_file

    ds, global_vmin, global_vmax = open_nc_with_stats(filename, variable)

    if variable == 'wind_speed' or variable == 'u10' or variable == 'v10':
        if 'u10' in ds and 'v10' in ds:
            u_data = get_tile_data(ds, 'u10', x, y, z, time_idx=0)
            v_data = get_tile_data(ds, 'v10', x, y, z, time_idx=0)

            tile_data = np.sqrt(u_data**2 + v_data**2)

            if 'valid_time' in ds['u10'].dims:
                u_global = ds['u10'].isel(valid_time=0).values
                v_global = ds['v10'].isel(valid_time=0).values
            else:
                u_global = ds['u10'].values
                v_global = ds['v10'].values

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
                ds, variable, x, y, z, time_idx=0, level_index=level_index)

            if 'valid_time' in var.dims:
                level_data = var.isel(
                    valid_time=0, pressure_level=level_index).values
            else:
                level_data = var.isel(pressure_level=level_index).values

            vmin = np.nanpercentile(level_data, 2)
            vmax = np.nanpercentile(level_data, 98)

            print(
                f"Geopotential at {pressure_level}hPa: {vmin:.2f} - {vmax:.2f}")
            cmap = get_panoply_colormap("NEO_modis_sst_45")
        else:
            tile_data = get_tile_data(ds, variable, x, y, z, time_idx=0)
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
