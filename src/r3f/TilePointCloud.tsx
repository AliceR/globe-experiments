import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { latLonToVector3 } from './utils/geo';
import { clamp, getAllTiles, getTileUrl, pixelToLatLon } from './utils/tiles';

type TilePointCloudProps = {
  zoom?: number;
  radius?: number;
  pointSize?: number;
  lodStep?: number; // skip every Nth pixel for LOD
};

/**
 * Point cloud visualization of tiles at a given zoom level
 * Creates a point for each pixel in the tile images
 * and positions them on the globe surface using the points geometry
 *
 * @param zoom - Tile zoom level (e.g., 1-5)
 * @param radius - Globe radius for positioning tile pixel points
 * @param pointSize - Size of each point in the point cloud in pixels
 * @param lodStep - Level of detail step, skips every Nth pixel for LOD
 * @returns JSX element representing the point cloud of tiles
 */
export const TilePointCloud: React.FC<TilePointCloudProps> = ({
  zoom = 1,
  radius = 1,
  pointSize = 1,
  lodStep = 1
}) => {
  const [tileImages, setTileImages] = useState<Array<{
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }> | null>(null);
  // Clamp zoom to valid range
  const clampedZoom = clamp(zoom);
  // Generate all tiles for the given zoom level
  const tiles = useMemo(() => getAllTiles(clampedZoom), [clampedZoom]);

  useEffect(() => {
    let isMounted = true;
    let loadedTiles: Array<{
      x: number;
      y: number;
      z: number;
      width: number;
      height: number;
      data: Uint8ClampedArray;
    }> = [];
    let tilesToLoad = tiles.length;
    if (tilesToLoad === 0) {
      setTileImages([]);
      return;
    }
    tiles.forEach(({ x, y, z }) => {
      const tileUrl = getTileUrl(x, y, z);

      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = tileUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        loadedTiles.push({
          x,
          y,
          z,
          width: img.width,
          height: img.height,
          data: imageData.data
        });
        tilesToLoad--;
        if (tilesToLoad === 0 && isMounted) {
          setTileImages(loadedTiles);
        }
      };
    });
    return () => {
      isMounted = false;
      setTileImages(null); // Clear image data on unmount
      loadedTiles = []; // Clear loaded tiles
    };
  }, [tiles]);

  const geometry = useMemo(() => {
    if (!tileImages || tileImages.length === 0) return undefined;

    const positions: number[] = [];
    const colors: number[] = [];

    console.log(`Processing ${tileImages.length} tiles for point cloud`);

    tileImages.forEach(
      ({ x: tileX, y: tileY, z: tileZ, width, height, data }) => {
        const nTiles = Math.pow(2, tileZ);
        let tilePixels = 0;

        for (let y = 0; y < height; y += lodStep) {
          for (let x = 0; x < width; x += lodStep) {
            const idx = (y * width + x) * 4; // Multiplying by 4 moves to the next pixel
            const r = data[idx] / 255; // Division by 255 to normalize to [0, 1]
            const g = data[idx + 1] / 255;
            const b = data[idx + 2] / 255;
            const a = data[idx + 3] / 255;

            if (a < 0.05) continue; // Skip transparent pixels

            const [lat, lon] = pixelToLatLon(
              x,
              y,
              tileX,
              tileY,
              width,
              height,
              nTiles
            );
            const vec = latLonToVector3(lat, lon, radius);
            positions.push(vec.x, vec.y, vec.z);
            colors.push(r, g, b);
            tilePixels++;
          }
        }
        console.log(
          `Tile ${tileX},${tileY},${tileZ}: ${width}x${height}, ${tilePixels} valid pixels`
        );
      }
    );

    console.log(`Final point count: ${positions.length / 3}`);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, [tileImages, radius, lodStep]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      vertexColors: true,
      size: pointSize,
      sizeAttenuation: false,
      transparent: false,
      opacity: 1
    });
  }, [pointSize]);

  if (!geometry) return null;
  return (
    <group>
      <points geometry={geometry} material={material} />
      <mesh>
        {/* White sphere as background */}
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>
    </group>
  );
};
