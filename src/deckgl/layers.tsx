import { COORDINATE_SYSTEM } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { SphereGeometry } from '@luma.gl/engine';

import { markers } from '../data/markers';
import { getTileUrl } from '../r3f/utils/tiles';

import type {
  DataLayersProps,
  MarkerData,
  RenderSubLayersProps,
  TileLayerProps
} from './types';

export const EARTH_RADIUS_METERS = 6.3e6;

export const backgroundLayers = [
  new SimpleMeshLayer({
    id: 'earth-sphere',
    data: [0],
    mesh: new SphereGeometry({
      radius: EARTH_RADIUS_METERS,
      nlat: 18,
      nlong: 36
    }),
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getPosition: [0, 0, 0],
    getColor: [255, 255, 255]
  }),

  // Earth coastline layer
  new GeoJsonLayer({
    id: 'coastline',
    data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_coastline.geojson',
    // Styles
    stroked: true,
    filled: false,
    opacity: 1.0,
    getLineColor: [30, 80, 120, 255],
    getLineWidth: 1,
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 3
  })
];

export const dataLayers = (
  handleMarkerClick: DataLayersProps['handleMarkerClick'],
  rotationState: DataLayersProps['rotationState'],
  setIsMarkerHovered: DataLayersProps['setIsMarkerHovered']
) => [
  // Tile layer with VEDA data
  new TileLayer({
    id: 'veda-tile-layer',
    getTileData: ({ index }: TileLayerProps) => {
      const { x, y, z } = index;
      const url = getTileUrl(x, y, z);
      return fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = URL.createObjectURL(blob);
          });
        });
    },
    maxZoom: 4,
    minZoom: 0,
    tileSize: 256,
    renderSubLayers: (props: RenderSubLayersProps) => {
      const { tile, data } = props;
      const { boundingBox } = tile;
      return new BitmapLayer({
        ...props,
        data: undefined,
        image: data,
        bounds: [
          boundingBox[0][0], // west
          boundingBox[0][1], // south
          boundingBox[1][0], // east
          boundingBox[1][1] // north
        ]
      });
    }
  }),

  // Markers layer
  new ScatterplotLayer({
    id: 'markers-layer',
    data: markers,
    getPosition: (marker: MarkerData) => [marker.lon, marker.lat, 0],
    getRadius: 50000, // radius in meters
    getFillColor: [255, 100, 100, 200],
    getLineColor: [255, 255, 255],
    getLineWidth: 10000,
    radiusMinPixels: 5,
    radiusMaxPixels: 15,
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 3,
    stroked: true,
    filled: true,
    pickable: true,
    onClick: handleMarkerClick,
    onHover: (info) => {
      setIsMarkerHovered(!!info.object);
    },
    updateTriggers: {
      getRadius: rotationState // Re-render when rotation state changes for hover effects
    }
  })
];
