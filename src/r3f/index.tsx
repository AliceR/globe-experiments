import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import { RotationControlButton } from './RotationControlButton';
import { GlobeProvider } from './contexts/GlobeProvider';

export default function R3FGlobe() {
  return (
    <GlobeProvider>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
          <Scene />
        </Canvas>
        <RotationControlButton />
      </div>
    </GlobeProvider>
  );
}
