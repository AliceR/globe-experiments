import { useTexture } from '@react-three/drei';
import { DEFAULT_GLOBE_RADIUS } from './Scene';

function Earth({ radius = DEFAULT_GLOBE_RADIUS }: { radius?: number }) {
  const [colorMap, bumpMap] = useTexture([
    '/textures/world.topo.bathy.200407.3x5400x2700.png',
    '/textures/world.topo.bathy.200407.3x5400x2700.png'
  ]);

  return (
    <mesh rotation={[0, 0, 0]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={colorMap} bumpMap={bumpMap} bumpScale={0.5} />
    </mesh>
  );
}

export default Earth;
