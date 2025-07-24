import { createContext } from 'react';
import * as THREE from 'three';

interface GlobeContextType {
  globeGroup: THREE.Group | null;
}

export const GlobeContext = createContext<GlobeContextType>({
  globeGroup: null
});
