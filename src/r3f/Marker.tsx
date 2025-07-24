import { useContext } from 'react';
import { latLonToVector3 } from './utils/geo';
import { GlobeContext } from './contexts/GlobeContext';
import { useMarkerVisibility } from './hooks/useMarkerVisibility';
import { DEFAULT_GLOBE_RADIUS } from './GlobeWrapper';

export function Marker({ lat, lon }: { lat: number; lon: number }) {
  const pos = latLonToVector3(lat, lon, 1);
  const { globeGroup } = useContext(GlobeContext);
  const { isVisible } = useMarkerVisibility(
    lat,
    lon,
    globeGroup,
    DEFAULT_GLOBE_RADIUS,
    1.01
  );

  // Don't render if not visible (performance optimization)
  if (!isVisible) {
    return null;
  }

  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.01, 16, 16]} />
      <meshStandardMaterial color='red' />
    </mesh>
  );
}
