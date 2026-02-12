import numpy as np
import mercantile

TILE_SIZE = 256


def tile_bounds(z: int, x: int, y: int):
    """Return lon/lat bounds of tile"""
    b = mercantile.bounds(x, y, z)
    return b.west, b.south, b.east, b.north


def tile_lonlat_grid(z, x, y):
    """Create lon/lat grid for each pixel in tile"""
    west, south, east, north = tile_bounds(z, x, y)

    lons = np.linspace(west, east, TILE_SIZE)
    lats = np.linspace(north, south, TILE_SIZE)  # flip

    return np.meshgrid(lons, lats)


def get_panoply_colormap(name="NEO_modis_sst_45"):
    """
    Возвращает цветовую схему Panoply по имени.
    Полный список: https://www.giss.nasa.gov/tools/panoply/colorbars/
    """
    import matplotlib.colors as mcolors

    # ----- Sequential (для обычных значений от мин к макс) -----
    palettes = {
        # ДЛЯ ГЕОПОТЕНЦИАЛА/ТЕМПЕРАТУРЫ МОРЯ - идеально для 850 гПа
        "NEO_modis_sst_45": ['#053061', '#2166ac', '#4393c3', '#92c5de', '#f7f7f7',
                             '#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'],

        # Классическая Panoply для температуры воздуха
        "GIST_heat": [
            '#000000',  # чёрный
            '#8b0000',  # тёмно-красный
            '#ff0000',  # красный
            '#ff4500',  # оранжево-красный
            '#ff8c00',  # оранжевый
            '#ffd700',  # золотой
            '#ffff00',  # жёлтый
            '#ffffe0',  # светло-жёлтый
            '#ffffff'   # белый
        ],

        # Для осадков/облачности
        "NEO_trmm_rainfall": [
            '#ffffff',  # белый
            '#deebf7',
            '#c6dbef',
            '#9ecae1',
            '#6baed6',
            '#4292c6',
            '#2171b5',
            '#08519c',
            '#08306b'   # тёмно-синий
        ],

        # Для аномалий (дивергентная)
        "NCDC_temp_anom": [
            '#053061',  # тёмно-синий
            '#2166ac',
            '#4393c3',
            '#92c5de',
            '#d1e5f0',
            '#f7f7f7',  # белый
            '#fddbc7',
            '#f4a582',
            '#d6604d',
            '#b2182b',
            '#67001f'   # тёмно-красный
        ],

        # Для ветра
        "NEO_wind_spd_anom": [
            '#4d004b',  # тёмно-фиолетовый
            '#810f7c',
            '#88419d',
            '#8c6bb1',
            '#8c96c6',
            '#9ebcda',
            '#bfd3e6',
            '#e0ecf4',
            '#f7f7f7',  # белый
            '#fee8c8',
            '#fdbb84',
            '#fc8d59',
            '#e34a33',
            '#b30000',  # красный
            '#7f0000'   # тёмно-красный
        ],

        # Топографическая (суша/океан)
        "GIST_earth": [
            '#0080ff',  # глубокий океан
            '#33a1ff',  # мелководье
            '#87cefa',  # прибрежные воды
            '#90ee90',  # низменность
            '#32cd32',  # леса
            '#228b22',  # возвышенность
            '#8b5a2b',  # предгорья
            '#a0522d',  # горы
            '#d2b48c',  # высокогорья
            '#ffffff'   # снег/лёд
        ]
    }

    # По умолчанию - SST палитра (синий-белый)
    colors = palettes.get(name, palettes["NEO_modis_sst_45"])

    # Создаём дискретную цветовую карту с чёткими границами
    return mcolors.ListedColormap(colors, name=name)
