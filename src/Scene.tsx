import { OrbitControls, Stats } from '@react-three/drei';

import Earth from './Earth';
import GlobeWrapper, { DEFAULT_GLOBE_RADIUS } from './GlobeWrapper';
import { markers } from './data/markers';
import { Marker } from './Marker';

// Both the Earth and its wrapper use the same radius value for accurate alignment between cursor interaction and globe surface
const EARTH_RADIUS = DEFAULT_GLOBE_RADIUS;

function Scene() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.5} />

      {/* Directional light for shadows and depth */}
      <directionalLight position={[-10, 10, 15]} intensity={5} />

      {/* Earth mesh */}
      <GlobeWrapper radius={EARTH_RADIUS}>
        <Earth radius={EARTH_RADIUS} />
        {markers.map((m) => (
          <Marker key={m.id} {...m} />
        ))}
      </GlobeWrapper>

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={false}
        minDistance={1.2}
        maxDistance={8}
      />

      {/* Performance stats */}
      <Stats />
    </>
  );
}

export default Scene;
