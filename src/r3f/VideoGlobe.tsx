import { useVideoTexture } from './hooks/useVideoTexture';
import { DEFAULT_GLOBE_RADIUS } from './Scene';

function VideoGlobe({ radius = DEFAULT_GLOBE_RADIUS }) {
  const texture = useVideoTexture(
    '/textures/Aerosols_4096x2048_30fps_h264.mp4'
  );

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
export default VideoGlobe;
