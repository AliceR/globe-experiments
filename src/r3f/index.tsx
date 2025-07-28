import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import { RotationControlButton } from '../components/RotationControlButton';
import { GlobeProvider } from './contexts/GlobeProvider';
import { useContext } from 'react';
import { GlobeContext } from './contexts/GlobeContext';

export default function R3FGlobe() {
  return (
    <GlobeProvider>
      <R3FGlobeInner />
    </GlobeProvider>
  );
}

function R3FGlobeInner() {
  const { rotationState, setRotationState } = useContext(GlobeContext);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
        <Scene />
      </Canvas>
      <RotationControlButton
        rotationState={rotationState}
        setRotationState={setRotationState}
      />
    </div>
  );
}
