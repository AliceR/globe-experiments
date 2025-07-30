import type { LayerProps, PickingInfo } from '@deck.gl/core';
import type { RotationState } from './contexts/GlobeContext';

export interface MarkerData {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface DataLayersProps {
  handleMarkerClick: (info: PickingInfo<MarkerData>) => void;
  rotationState: RotationState;
  setIsMarkerHovered: (hovered: boolean) => void;
}

export interface TileLayerProps {
  index: { x: number; y: number; z: number };
}

export interface RenderSubLayersProps extends LayerProps {
  tile: { boundingBox: [number[], number[]] };
  data: HTMLImageElement;
}
