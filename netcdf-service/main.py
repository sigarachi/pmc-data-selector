from helpers import tile_lonlat_grid, TILE_SIZE, get_panoply_colormap, is_tile_allowed
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
import xarray as xr
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import matplotlib.colors as mcolors
import io
from typing import Dict, Optional, Tuple, List
import threading
import sqlite3
from pathlib import Path
import matplotlib.cm as cm
from scipy.interpolate import RegularGridInterpolator
from scipy.spatial import cKDTree
from scipy.interpolate import griddata
import pandas as pd
import glob
import os
import psycopg
import json
from contextlib import asynccontextmanager
from environs import Env
from opensearch_logger import OpenSearchHandler
import os
import psycopg_pool
import asyncio
import logging


FONT_PATH = Path(__file__).parent / "assets/fonts/Inter.ttf"

pool = None

nc_lock = asyncio.Lock()


def get_font(size=24):
    try:
        return ImageFont.truetype(FONT_PATH, size)
    except Exception:
        return ImageFont.truetype("arial.ttf", size)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pool

    pool = psycopg_pool.AsyncConnectionPool(DB_DSN)

    await startup_event()

    yield

    await pool.close()

app = FastAPI(lifespan=lifespan)

env = Env()
env.read_env()

DATASET_CACHE: Dict[str, Tuple[xr.Dataset, float]] = {}
STATS_CACHE: Dict[str, Dict[str, Tuple[float, float]]] = {}
CACHE_LOCK = threading.RLock()
MAX_CACHE_SIZE = 3
CACHE_TTL = 300
DB_DSN = os.environ.get('DB_URL')

handler = OpenSearchHandler(
    index_name="netcdf-service",
    hosts=[os.environ.get('OPENSEARCH_URL')],
    http_auth=(os.environ.get('OPENSEARCH_USERNAME'),
               os.environ.get('OPENSEARCH_PASSWORD')),
    http_compress=True,
    use_ssl=True,
    verify_certs=False,
    ssl_assert_hostname=False,
    ssl_show_warn=False,
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(handler)

datasets = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@asynccontextmanager
async def get_conn():
    async with pool.connection() as conn:
        yield conn


async def init_database():
    logger.info("Инициализация бд")
    async with get_conn() as conn:
        async with conn.cursor() as cur:

            await cur.execute("""
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

            await cur.execute("""
            CREATE TABLE IF NOT EXISTS dataset_times (
                id BIGSERIAL PRIMARY KEY,
                dataset_id BIGINT REFERENCES datasets(id) ON DELETE CASCADE,
                time_value TIMESTAMP NOT NULL,
                time_index INTEGER NOT NULL
            )
            """)

            await cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_dataset_type_time
            ON datasets(dataset_type, dataset_time)
            """)

            await cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_dataset_times_dataset_time
            ON dataset_times(dataset_id, time_value)
            """)


def _extract_dataset_info(
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
        logger.error(f"Error in reading file {file_path}: {e}")
        import traceback
        traceback.print_exc()
        return None, None, [], []


async def extract_dataset_info(file_path: str):
    return await run_in_threadpool(_extract_dataset_info, file_path)


async def update_database_index():
    nc_files = glob.glob('./data/*.nc')

    async with get_conn() as conn:
        async with conn.cursor() as cur:

            for file_path in nc_files:
                file_path = str(Path(file_path).resolve())
                stat = os.stat(file_path)

                await cur.execute(
                    "SELECT id, last_modified FROM datasets WHERE file_path=%s",
                    (file_path,)
                )

                row = await cur.fetchone()

                if row and abs(row[1] - stat.st_mtime) < 1:
                    continue

                dataset_type, dataset_time, variables, times = await extract_dataset_info(
                    file_path)

                if dataset_time is None:
                    continue

                variables_json = json.dumps(variables)

                if row:
                    dataset_id = row[0]

                    await cur.execute("""
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

                    await cur.execute(
                        "DELETE FROM dataset_times WHERE dataset_id=%s",
                        (dataset_id,)
                    )

                else:
                    await cur.execute("""
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
                    row = await cur.fetchone()
                    dataset_id = row[0]

                for i, t in enumerate(times):
                    await cur.execute("""
                        INSERT INTO dataset_times(dataset_id, time_value, time_index)
                        VALUES (%s,%s,%s)
                    """, (dataset_id, t, i))


async def find_matching_dataset_by_time(pmc_time, dataset_type="era5", time_tolerance_hours=3):
    async with get_conn() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT file_path, dataset_time
                FROM datasets
                WHERE dataset_type=%s
                ORDER BY ABS(EXTRACT(EPOCH FROM (dataset_time - %s)))
                LIMIT 1
            """, (dataset_type, pmc_time))

            row = await cur.fetchone()

            if row:
                file_path, file_time = row
                diff = abs((pmc_time - file_time).total_seconds() / 3600)
                if diff <= time_tolerance_hours:
                    return file_path, file_time, diff

    return await find_in_times_table(pmc_time, dataset_type, time_tolerance_hours)


async def find_in_times_table(pmc_time, dataset_type="era5", time_tolerance_hours=3):

    async with get_conn() as conn:
        async with conn.cursor() as cur:

            await cur.execute("""
                SELECT d.file_path, dt.time_value
                FROM datasets d
                JOIN dataset_times dt ON d.id = dt.dataset_id
                WHERE d.dataset_type=%s
            """, (dataset_type,))

            rows = await cur.fetchall()
            best = None
            best_diff = 1e9

            for file_path, file_time in rows:
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
    logger.info("Запуск startup события...")
    try:
        await init_database()
        await update_database_index()

        async with get_conn() as conn:
            async with conn.cursor() as cur:

                await cur.execute("SELECT COUNT(*) FROM datasets")
                row = await cur.fetchone()
                total_files = row[0]

                await cur.execute(
                    "SELECT COUNT(DISTINCT dataset_type) FROM datasets")
                count_row = await cur.fetchone()
                types_count = count_row[0]

                await cur.execute("""
                    SELECT dataset_type, COUNT(*)
                    FROM datasets
                    GROUP BY dataset_type
                """)
                type_stats = await cur.fetchall()

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
        # chunks={},
        cache=True
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


def remap_carra_data(data, lats, lons, target_lat_grid, target_lon_grid):
    """
    Пересчет данных CARRA с исходной сетки на целевую

    Parameters:
    - data: 2D массив данных (original_y, original_x)
    - lats: 2D массив широт (original_y, original_x)
    - lons: 2D массив долгот (original_y, original_x)
    - target_lat_grid: 2D массив целевых широт (256, 256)
    - target_lon_grid: 2D массив целевых долгот (256, 256)

    Returns:
    - 2D массив (256, 256) с пересчитанными данными
    """
    # Расплющиваем исходные данные
    from scipy.spatial import cKDTree
    points = np.column_stack((lats.ravel(), lons.ravel()))
    values = data.ravel()

    tree = cKDTree(points)

    query = np.column_stack((target_lat_grid.ravel(), target_lon_grid.ravel()))

    dist, idx = tree.query(query)

    tile = values[idx].reshape(256, 256)

    tile[dist.reshape(256, 256) > 0.1] = np.nan

    # Возвращаем в исходную форму тайла
    return tile


def get_tile_data(dataset, variable, x, y, z, time_idx=0, level_index=0):
    ds = dataset
    var = ds[variable]

    # Извлечение данных
    if 'pressure_level' in var.dims:
        data = var.isel(valid_time=time_idx, pressure_level=level_index).values
    else:
        if 'valid_time' in var.dims:
            data = var.isel(valid_time=time_idx).values
        else:
            data = var.values

    # Приводим к 2D
    if data.ndim != 2:
        data = data.squeeze()
        if data.ndim != 2:
            data = data.reshape(-1, data.shape[-2], data.shape[-1])[0]

    # Получаем координаты
    lats = var.latitude.values
    lons = var.longitude.values

    # Получаем целевую сетку тайла
    lon_grid, lat_grid = tile_lonlat_grid(z, x, y)

    # Для CARRA (2D координаты) используем remap
    if lats.ndim == 2 and lons.ndim == 2:
        tile = remap_carra_data(data, lats, lons, lat_grid, lon_grid)
    else:
        # Для ERA5 (1D координаты) используем RegularGridInterpolator
        from scipy.interpolate import RegularGridInterpolator
        from scipy.spatial import cKDTree

        if lats[0] > lats[-1]:
            lats = lats[::-1]
            data = data[::-1, :]

        if lons[0] > lons[-1]:
            lons = lons[::-1]
            data = data[:, ::-1]

        interp = RegularGridInterpolator(
            (lats, lons),
            data,
            method="nearest",
            bounds_error=False,
            fill_value=np.nan
        )

        pts = np.stack([lat_grid.ravel(), lon_grid.ravel()], axis=-1)
        tile = interp(pts).reshape(256, 256)

    return tile


def compute_variable_stats(ds, variable, time_index, pressure_level):
    var = ds[variable]

    level_index = 0

    if 'pressure_level' in var.dims:
        levels = var.pressure_level.values
        level_index = int(
            np.argmin(np.abs(levels.astype(float) - float(pressure_level))))

    if 'valid_time' in var.dims and 'pressure_level' in var.dims:
        data = var.isel(valid_time=time_index,
                        pressure_level=level_index).values
    elif 'valid_time' in var.dims:
        data = var.isel(valid_time=time_index).values
    else:
        data = var.values

    vmin = float(np.nanpercentile(data, 2))
    vmax = float(np.nanpercentile(data, 98))

    return vmin, vmax

# variable: str, t: int = 0


def make_no_data_tile(text: str = "Нет данных") -> bytes:
    img = Image.new("RGBA", (256, 256), (240, 240, 240, 255))
    draw = ImageDraw.Draw(img)

    font = get_font()

    bbox = draw.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]

    draw.text(((256 - w) / 2, (256 - h) / 2),
              text, fill=(80, 80, 80), font=font)

    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


def draw_arrow_polygon(draw, x, y, u, v, length, width, head_len, head_width, color):
    angle = np.arctan2(-v, u)

    cos_a = np.cos(angle)
    sin_a = np.sin(angle)

    x_end = x + cos_a * length
    y_end = y + sin_a * length

    x_body = x + cos_a * (length - head_len)
    y_body = y + sin_a * (length - head_len)

    px = -sin_a
    py = cos_a

    p1 = (x + px * width/2, y + py * width/2)
    p2 = (x - px * width/2, y - py * width/2)
    p3 = (x_body - px * width/2, y_body - py * width/2)
    p4 = (x_body + px * width/2, y_body + py * width/2)

    tip = (x_end, y_end)
    left = (x_body + px * head_width/2, y_body + py * head_width/2)
    right = (x_body - px * head_width/2, y_body - py * head_width/2)

    polygon = [p1, p2, p3, right, tip, left, p4]

    draw.polygon(polygon, fill=color)


def draw_wind_arrows(img, u, v, step=32, scale=2.5, fixed_length=10):
    upscale = 2
    big = img.resize((img.width*upscale, img.height*upscale), Image.NEAREST)
    draw = ImageDraw.Draw(big)

    h, w = u.shape

    for j in range(0, h, step):
        for i in range(0, w, step):
            uu = u[j, i]
            vv = v[j, i]

            if np.isnan(uu) or np.isnan(vv):
                continue

            speed = np.sqrt(uu**2 + vv**2)
            if speed < 0.1:
                continue

            x = i * upscale
            y = j * upscale

            draw_arrow_polygon(
                draw,
                x, y,
                uu, vv,
                length=20.0,
                width=3.0,
                head_len=12.0,
                head_width=12.0,
                color="#000000"
            )

    return big.resize(img.size, Image.LANCZOS)


@app.get("/tile/{z}/{x}/{y}")
async def tile(variable: str, time: str, z: int, x: int, y: int, pressure_level: int = 850, type: str = "era5", u_vmin: Optional[float] = None,
               u_vmax: Optional[float] = None):
    logger.info(
        f"[Tile]: variable={variable}, time={time}, pressure_level={pressure_level}, type={type}")

    if (is_tile_allowed(z, x, y) == False):
        return Response(

        )

    time = pd.to_datetime(time, format='%m/%d/%Y %H:%M')

    time_tolerance_hours = 1

    if type == "carra":
        time_tolerance_hours = 3

    ds_file = await find_matching_dataset_by_time(
        time, dataset_type=type, time_tolerance_hours=time_tolerance_hours)

    if ds_file is None or variable is None:
        logger.error(
            f"[Tile] No data found: variable={variable}, time={time}, pressure_level={pressure_level}, type={type}")
        return Response(
            content=make_no_data_tile(),
            media_type="image/png"
        )

    filename, dataset, time_diff = ds_file

    async with nc_lock:
        ds, global_vmin, global_vmax = await run_in_threadpool(
            open_nc_with_stats, filename, variable
        )

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
            tile_data = get_tile_data(
                ds, variable, x, y, z, time_idx=0)
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
                ds, variable, x, y, z, time_idx=time_index, level_index=level_index,)

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
                ds, variable, x, y, z, time_idx=time_index, type=type)
            vmin, vmax = global_vmin, global_vmax
            cmap = get_panoply_colormap("NEO_modis_sst_45")

    mask = np.isnan(tile_data)

    if mask.all():
        img = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    else:

        if u_vmin is not None:
            vmin = float(u_vmin)

        if u_vmax is not None:
            vmax = float(u_vmax)

        # защита от деления на 0
        if vmax <= vmin:
            vmax = vmin + 1e-6

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

    if variable in ["u", "u10"]:
        img = draw_wind_arrows(img, u_data, v_data, scale=0.7, step=24)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(buf.getvalue(), media_type="image/png")


@app.get("/legend")
async def legend(
    variable: str,
    time: str,
    pressure_level: int = 850,
    type: str = "era5",
    vmin: Optional[float] = None,
    vmax: Optional[float] = None
):
    logger.info(
        f"[Legend]: variable={variable}, time={time}, pressure_level={pressure_level}, type={type}, vmin={vmin}, vmax={vmax}")
    time = pd.to_datetime(time, format='%m/%d/%Y %H:%M')

    ds_file = await find_matching_dataset_by_time(
        time, dataset_type=type, time_tolerance_hours=1
    )

    if ds_file is None:
        return {}

    filename, dataset, _ = ds_file

    async with nc_lock:
        ds = get_cached_dataset(filename)

    # ---- найти time_index ----
    times = ds[variable].valid_time.values
    time_index = 0
    for i, t in enumerate(times):
        if abs((pd.to_datetime(t) - time).total_seconds()) <= 3600:
            time_index = i
            break

    if variable in ["u", "v"] and "u" in ds and "v" in ds:

        if "pressure_level" in ds["u"].dims:
            levels = ds["u"].pressure_level.values
            level_index = np.argmin(
                np.abs(levels.astype(float) - float(pressure_level)))

            u = ds["u"].isel(valid_time=time_index,
                             pressure_level=level_index).values
            v = ds["v"].isel(valid_time=time_index,
                             pressure_level=level_index).values
        else:
            u = ds["u"].isel(valid_time=time_index).values
            v = ds["v"].isel(valid_time=time_index).values

        wind = np.sqrt(u**2 + v**2)

        auto_vmin = float(np.nanpercentile(wind, 2))
        auto_vmax = float(np.nanpercentile(wind, 98))

    elif variable in ["u10", "v10"] and "u10" in ds and "v10" in ds:

        u = ds["u10"].isel(valid_time=time_index).values
        v = ds["v10"].isel(valid_time=time_index).values

        wind = np.sqrt(u**2 + v**2)

        auto_vmin = float(np.nanpercentile(wind, 2))
        auto_vmax = float(np.nanpercentile(wind, 98))

    else:
        auto_vmin, auto_vmax = compute_variable_stats(
            ds, variable, time_index, pressure_level
        )

    # ---- пользовательские пределы имеют приоритет ----
    vmin = float(vmin) if vmin is not None else auto_vmin
    vmax = float(vmax) if vmax is not None else auto_vmax

    # защита
    if vmax <= vmin:
        vmax = vmin + 1e-6

    # ---- цвета ----
    cmap = get_panoply_colormap("NEO_modis_sst_45")
    colors = [mcolors.to_hex(c) for c in cmap.colors]

    n = len(colors)

    # ---------------------------
    # UNDER/OVER схема
    # C0 = < vmin
    # C1..C(n-2) = диапазон
    # C(n-1) = > vmax
    # bins = n-1  (меньше на 2 как ты хотел)
    # ---------------------------

    inner_intervals = n
    bins = np.linspace(vmin, vmax, inner_intervals + 1).tolist()

    unit_map = {
        "z": "м",
        "u": "м/с",
        "v": "м/с",
        "u10": "м/с",
        "v10": "м/с"
    }

    return {
        "vmin": vmin,
        "vmax": vmax,
        "bins": bins,
        "colors": colors,
        "underflow_color": colors[0],
        "overflow_color": colors[-1],
        "unit": unit_map.get(variable, "")
    }
