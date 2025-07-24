import { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

import {
  clamp,
  getAllTiles,
  getTileBounds,
  getTileUrl,
  tileUVToLatLon
} from './utils/tiles';
import { latLonToVector3 } from './utils/geo';

/**
 * Props for the TileLayer component
 */
interface TileLayerProps {
  /** Tile zoom level (e.g., 2-5) */
  zoom: number;
  /** Opacity of the tile layer */
  opacity?: number;
  /** Globe radius for positioning tiles */
  radius?: number;
}

/**
 * Safe texture loader hook: returns texture or null if loading fails
 */
function useTexture(url: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        if (isMounted) setTexture(tex);
      },
      undefined,
      () => {
        if (isMounted) setTexture(null);
      }
    );
    return () => {
      isMounted = false;
    };
  }, [url]);
  return texture;
}

/**
 * Individual tile component that loads and displays a single Tile
 * mapping the texture to a curved mesh that follows the sphere surface
 */
function Tile({
  x,
  y,
  z,
  opacity = 1,
  radius = 1.01
}: {
  x: number;
  y: number;
  z: number;
  opacity?: number;
  radius: number;
}) {
  const tileUrl = getTileUrl(x, y, z);
  const texture = useTexture(tileUrl);

  // Calculate tile bounds
  const bounds = useMemo(() => getTileBounds(x, y, z), [x, y, z]);

  // Create a curved tile geometry that follows the sphere surface
  const geometry = useMemo(() => {
    const { north, south, east, west } = bounds;

    // Create a subdivided plane geometry for smooth sphere mapping
    const segments = 12; // Sufficient subdivision for smooth curves
    const geo = new THREE.PlaneGeometry(1, 1, segments, segments);

    // Transform each vertex to its correct position on the sphere
    const positions = geo.attributes.position;

    // For each vertex i in the plane geometry:
    for (let i = 0; i < positions.count; i++) {
      // 1. Get plane coordinates: (planeX, planeY, planeZ)
      const planeX = positions.getX(i);
      const planeY = positions.getY(i);
      // const planeZ = positions.getZ(i);

      // 2. Normalize to UV space: u = planeX + 0.5, v = planeY + 0.5
      const u = planeX + 0.5;
      const v = planeY + 0.5;

      // 3. Convert UV to equirectangular lat/lon using utility function
      const { lat, lon } = tileUVToLatLon(u, v, {
        north,
        south,
        east,
        west
      });

      // 4. Convert to sphere coordinates
      const [sphereX, sphereY, sphereZ] = latLonToVector3(lat, lon, radius);

      // 5. Update vertex position: positions.setXYZ(i, sphereX, sphereY, sphereZ)
      positions.setXYZ(i, sphereX, sphereY, sphereZ);
    }

    positions.needsUpdate = true;
    geo.computeVertexNormals();

    return geo;
  }, [bounds, radius]);

  // If texture failed to load, render nothing (skip this tile)
  if (!texture) return null;

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        map={texture}
        transparent={true}
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * TileLayer component that overlays raster tiles on a 3D globe
 */
export function TileLayer({
  zoom,
  opacity = 1,
  radius = 1.01
}: TileLayerProps) {
  // Clamp zoom to valid range
  const clampedZoom = clamp(zoom);
  // Generate all tiles for the given zoom level
  const tiles = useMemo(() => getAllTiles(clampedZoom), [clampedZoom]);

  // Memoize the tile layer based on zoom
  const tileElements = useMemo(() => {
    return tiles.map(({ x, y, z }) => (
      <Tile
        key={`${x}-${y}-${z}`}
        x={x}
        y={y}
        z={z}
        opacity={opacity}
        radius={radius}
      />
    ));
  }, [tiles, opacity, radius]);

  return <group>{tileElements}</group>;
}

export default TileLayer;
