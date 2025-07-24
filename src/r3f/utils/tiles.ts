/**
 * Utility functions for working with Web Mercator tiles on 3D globes
 * Handles projection conversions from Web Mercator to equirectangular for proper sphere mapping
 */

/**
 * Calculates the number of tiles at a given zoom level for standard Web Mercator
 *
 * @param zoom - Zoom level
 * @returns Object with number of columns and rows
 */
function getTileCount(zoom: number): { cols: number; rows: number } {
  // Standard Web Mercator tiling: 2^zoom tiles per dimension
  // Level 0: 1x1, Level 1: 2x2, Level 2: 4x4, Level 3: 8x8, etc.

  if (zoom < 0) {
    return { cols: 1, rows: 1 };
  }

  const tilesPerDimension = Math.pow(2, zoom);
  return {
    cols: tilesPerDimension,
    rows: tilesPerDimension
  };
}

/**
 * Clamp zoom level to a reasonable range
 * This prevents excessive zooming that could lead to performance issues
 *
 * @param zoom - Zoom level to clamp
 * @returns Clamped zoom level between 0 and MAX_ZOOM
 */
export function clamp(zoom: number): number {
  const MAX_ZOOM = 4;
  const clampedZoom = Math.min(Math.max(zoom, 0), MAX_ZOOM);
  if (zoom < 0 || zoom > MAX_ZOOM) {
    console.warn(
      `Zoom level ${zoom} is out of bounds (0-${MAX_ZOOM}). Clamping zoom level ${zoom} to ${clampedZoom}.`
    );
  }
  return clampedZoom;
}

/**
 * Converts Web Mercator Y coordinate to latitude
 * Based on: https://en.wikipedia.org/wiki/Web_Mercator_projection
 *
 * @param y - Web Mercator Y coordinate
 * @param z - Zoom level
 * @returns latitude in degrees
 */
function webMercatorYToLat(y: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return lat;
}

/**
 * Convert pixel coordinates to latitude and longitude.
 * @param x - The x coordinate of the pixel.
 * @param y - The y coordinate of the pixel.
 * @param tileX - The x coordinate of the tile.
 * @param tileY - The y coordinate of the tile.
 * @param width - The width of the tile.
 * @param height - The height of the tile.
 * @param nTiles - The number of tiles in the x and y directions.
 * @returns The latitude and longitude corresponding to the pixel coordinates.
 */
export function pixelToLatLon(
  x: number,
  y: number,
  tileX: number,
  tileY: number,
  width: number,
  height: number,
  nTiles: number
) {
  const px = tileX + x / width;
  const py = tileY + y / height;
  const lon = (px / nTiles) * 360 - 180;
  const lat =
    Math.atan(Math.sinh(Math.PI * (1 - 2 * (py / nTiles)))) * (180 / Math.PI);
  return [lat, lon];
}

/**
 * Converts UV coordinates within a Web Mercator tile to lat/lon
 *
 * @param u - U coordinate in [0, 1] range
 * @param v - V coordinate in [0, 1] range
 * @param tileBounds - Bounds of the tile in Web Mercator coordinates
 * @returns Object with latitude and longitude in degrees
 */
export function tileUVToLatLon(
  u: number,
  v: number,
  tileBounds: { north: number; south: number; east: number; west: number }
): { lat: number; lon: number } {
  // Linear interpolation for longitude (no distortion in Web Mercator)
  const lon = tileBounds.west + u * (tileBounds.east - tileBounds.west);

  // Linear interpolation for latitude
  const lat = tileBounds.south + v * (tileBounds.north - tileBounds.south);

  return { lat, lon };
}

/**
 * Calculates the bounding box for a Web Mercator tile
 */
export function getTileBounds(
  x: number,
  y: number,
  z: number
): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  const { cols } = getTileCount(z);

  // Longitude is linear in Web Mercator (no distortion)
  const lonStep = 360 / cols;
  const west = -180 + x * lonStep;
  const east = west + lonStep;

  // Latitude uses Web Mercator projection (distorted near poles)
  const north = webMercatorYToLat(y, z);
  const south = webMercatorYToLat(y + 1, z);

  return { north, south, east, west };
}

/**
 * Gets all tile coordinates for a given zoom level
 */
export function getAllTiles(
  zoom: number
): Array<{ x: number; y: number; z: number }> {
  const { cols, rows } = getTileCount(zoom);
  const tiles: Array<{ x: number; y: number; z: number }> = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      tiles.push({ x, y, z: zoom });
    }
  }

  return tiles;
}

/**
 * Constructs a tile URL for a web mercator tile service
 */
export function getTileUrl(x: number, y: number, z: number): string {
  // const baseUrl = 'https://tile.openstreetmap.org';
  // return `${baseUrl}/${z}/${x}/${y}.png`;

  const baseUrl =
    'https://openveda.cloud/api/raster/searches/ef5766e5684b02f6bf65185f542354f3/tiles/WebMercatorQuad';

  const params = `title=VEDA+Dashboard+Render+Parameters&rescale=0.000408%2C0.000419&colormap_name=rdylbu_r&reScale=NaN%2CNaN&assets=cog_default`;

  return `${baseUrl}/${z}/${x}/${y}?${params}`;

  // Satellite imagery option (requires API key):
  // const mapboxUrl = `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}@2x.jpg90?access_token=YOUR_TOKEN`;
}
