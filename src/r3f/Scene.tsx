import { OrbitControls, Stats } from '@react-three/drei';

import GlobeWrapper, { DEFAULT_GLOBE_RADIUS } from './GlobeWrapper';
import Earth from './Earth';
import { TileLayer } from './TileLayer';
import { TilePointCloud } from './TilePointCloud';
import VideoGlobe from './VideoGlobe';
import { markers } from '../data/markers';
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

      <GlobeWrapper radius={EARTH_RADIUS} debug={true}>
        {/* Earth mesh */}
        <Earth radius={EARTH_RADIUS} />

        {/* Tile layer */}
        <TileLayer
          zoom={3}
          opacity={0.8}
          radius={EARTH_RADIUS + 0.001} // Slightly above the globe surface
        />

        {/* Point cloud visualization of tiles */}
        <TilePointCloud
          zoom={2}
          radius={EARTH_RADIUS + 0.001} // Slightly above the globe surface
        />

        <VideoGlobe radius={EARTH_RADIUS} />

        {/* Markers for major cities */}
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
