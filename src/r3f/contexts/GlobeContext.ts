import { createContext } from 'react';
import * as THREE from 'three';

export type RotationState = 'rotating' | 'paused' | 'stopped';

interface GlobeContextType {
  globeGroup: THREE.Group | null;
  rotationState: RotationState;
  setRotationState: (state: RotationState) => void;
  setGlobeGroup: (group: THREE.Group | null) => void;
}

export const GlobeContext = createContext<GlobeContextType>({
  globeGroup: null,
  rotationState: 'rotating',
  setRotationState: () => {},
  setGlobeGroup: () => {}
});
