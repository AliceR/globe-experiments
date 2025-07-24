import { useContext, useState, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';

import { GlobeContext } from './contexts/GlobeContext';
import { useMarkerVisibility } from './hooks/useMarkerVisibility';
import { focusGlobeOnLatLon } from './utils/focusGlobeOnLatLon';
import { latLonToVector3 } from './utils/geo';

export function Marker({
  lat,
  lon,
  globeRadius
}: {
  lat: number;
  lon: number;
  globeRadius: number;
}) {
  const MARKER_OFFSET = 0.01; // Offset above the globe surface
  const pos = latLonToVector3(lat, lon, globeRadius + MARKER_OFFSET);
  const { globeGroup, rotationState, setRotationState } =
    useContext(GlobeContext);
  const { camera } = useThree();
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isVisible } = useMarkerVisibility(
    lat,
    lon,
    globeGroup,
    globeRadius,
    MARKER_OFFSET
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Don't render if not visible (performance optimization)
  if (!isVisible) {
    return null;
  }

  const handleClick = () => {
    // Clear any pending timeout when marker is clicked
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    focusGlobeOnLatLon({
      globeGroup,
      camera,
      lat,
      lon,
      setRotationState
    });
  };

  const handlePointerEnter = () => {
    // Clear any pending timeout when entering marker
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only pause if currently rotating (not if manually stopped)
    if (rotationState === 'rotating') {
      setRotationState('paused');
    }
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerLeave = () => {
    document.body.style.cursor = 'default';
    setIsHovered(false);

    // Only resume rotation after 3 seconds if currently paused (not if stopped)
    if (rotationState === 'paused') {
      timeoutRef.current = setTimeout(() => {
        setRotationState('rotating');
        timeoutRef.current = null;
      }, 3000);
    }
  };

  const markerScale = isHovered ? 1.5 : 1;

  return (
    <mesh
      position={pos}
      scale={markerScale}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      userData={{ isMarker: true }}
    >
      <sphereGeometry args={[0.01, 16, 16]} />
      <meshStandardMaterial color='red' />
    </mesh>
  );
}
