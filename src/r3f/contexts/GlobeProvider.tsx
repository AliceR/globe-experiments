import React, { useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { GlobeContext, type RotationState } from './GlobeContext';

export const GlobeProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [globeGroup, setGlobeGroup] = useState<THREE.Group | null>(null);
  const [rotationState, setRotationState] = useState<RotationState>('rotating');

  return (
    <GlobeContext.Provider
      value={{
        globeGroup,
        rotationState,
        setRotationState,
        setGlobeGroup
      }}
    >
      {children}
    </GlobeContext.Provider>
  );
};
