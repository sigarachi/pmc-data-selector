from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import xarray as xr
import numpy as np
from PIL import Image
import io
from functools import lru_cache
from pathlib import Path
import matplotlib.cm as cm
from scipy.interpolate import RegularGridInterpolator
import pandas as pd
import glob

from helpers import tile_lonlat_grid, TILE_SIZE

app = FastAPI()

DATASET_CACHE = {}

datasets = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Загрузить данные при запуске"""
    try:
        global datasets
        # УКАЖИТЕ ПУТЬ К ВАШЕМУ ФАЙЛУ
        datasets = safely_load_nc_files()

    except Exception as e:
        print(f"✗ Ошибка загрузки NetCDF: {e}")
        import traceback
        traceback.print_exc()


def open_nc_with_stats(dataset, variable: str):
    # ds = xr.open_dataset(path, engine="netcdf4", chunks={}, cache=True)

    arr = dataset[variable].values

    if arr.ndim == 3:
        arr = arr[0]

    valid = arr[~np.isnan(arr)]

    vmin = np.percentile(valid, 2)
    vmax = np.percentile(valid, 98)

    return dataset, float(vmin), float(vmax)


@lru_cache(maxsize=8)
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


def get_tile_data(dataset, variable, x, y, z, slice_index=0):
    ds = dataset

    var = ds[variable]

    data = var.values
    if data.ndim == 3:
        data = data[slice_index]

    lats = var.latitude.values
    lons = var.longitude.values

    # ---- ensure ascending ----
    if lats[0] > lats[-1]:
        lats = lats[::-1]
        data = data[::-1, :]

    if lons[0] > lons[-1]:
        lons = lons[::-1]
        data = data[:, ::-1]

    # ---- build interpolator ----
    interp = RegularGridInterpolator(
        (lats, lons),
        data,
        method="linear",          # smooth!
        bounds_error=False,      # outside → fill_value
        fill_value=np.nan
    )

    lon_grid, lat_grid = tile_lonlat_grid(z, x, y)

    pts = np.stack([lat_grid.ravel(), lon_grid.ravel()], axis=-1)

    tile = interp(pts).reshape(256, 256)

    return tile


# variable: str, t: int = 0


@app.get("/tile/{z}/{x}/{y}")
def tile(variable: str, time: str, z: int, x: int, y: int):

    time = pd.to_datetime(
        time, format='%m/%d/%Y %H:%M')

    print(time)

    ds_file = find_matching_dataset(time, datasets, time_tolerance_hours=1)

    if ds_file is None:
        return Response()

    filename, dataset, time_diff = ds_file

    tile_data = get_tile_data(dataset, variable, x, y, z, 0)

    mask = np.isnan(tile_data)

    if mask.all():
        img = Image.new("RGBA", (256, 256), (0, 0, 0, 0))

    else:
        ds, vmin, vmax = open_nc_with_stats(dataset, variable)

        norm = (tile_data - vmin) / (vmax - vmin)

        norm = np.clip(norm, 0, 1)

        rgba = (cm.viridis(norm) * 255).astype(np.uint8)
        rgba[..., 3] = (~mask) * 255

        img = Image.fromarray(rgba, "RGBA")

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    return Response(buf.getvalue(), media_type="image/png")
