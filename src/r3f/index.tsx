import { Canvas } from '@react-three/fiber';
import Scene from './Scene';

export default function R3FGlobe() {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
      <Scene />
    </Canvas>
  );
}
