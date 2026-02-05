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
