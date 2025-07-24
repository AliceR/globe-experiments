import { OrbitControls, Stats } from '@react-three/drei';
import { useControls } from 'leva';

import GlobeWrapper from './GlobeWrapper';
import Earth from './Earth';
// import { TileLayer } from './TileLayer';
// import { TilePointCloud } from './TilePointCloud';
// import VideoGlobe from './VideoGlobe';
import { markers } from '../data/markers';
import { Marker } from './Marker';

/** Default radius for the globe sphere geometry - centralized control point */
export const DEFAULT_GLOBE_RADIUS = 1;

// Both the Earth and its wrapper use the same radius value for accurate alignment between cursor interaction and globe surface
const EARTH_RADIUS = 1;

function Scene() {
  const { rotationSpeed } = useControls({
    rotationSpeed: { value: 0.005, min: 0, max: 0.1, step: 0.001 },
    wireframe: false
  });
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.5} />

      {/* Directional light for shadows and depth */}
      <directionalLight position={[-10, 10, 15]} intensity={5} />

      <GlobeWrapper
        autoRotationSpeed={rotationSpeed}
        radius={EARTH_RADIUS}
        debug={true}
      >
        {/* Earth mesh */}
        <Earth radius={EARTH_RADIUS} />

        {/* Tile layer */}
        {/* <TileLayer
          zoom={3}
          opacity={0.8}
          radius={EARTH_RADIUS + 0.001} // Slightly above the globe surface
        /> */}

        {/* Point cloud visualization of tiles */}
        {/* <TilePointCloud
          zoom={2}
          radius={EARTH_RADIUS + 0.002} // Slightly above the globe surface
        /> */}

        {/* <VideoGlobe radius={EARTH_RADIUS} /> */}

        {/* Markers for major cities */}
        {markers.map((m) => (
          <Marker key={m.id} {...m} globeRadius={EARTH_RADIUS} />
        ))}
      </GlobeWrapper>

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={false}
        minDistance={EARTH_RADIUS * 1.2} // Prevents zooming too close to the globe
        maxDistance={EARTH_RADIUS * 3}
      />

      {/* Performance stats */}
      <Stats />
    </>
  );
}

export default Scene;
