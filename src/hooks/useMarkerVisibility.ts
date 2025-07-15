import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * Hook to determine if a marker should be visible based on its position relative to the camera.
 * Uses dot product calculation to check if the marker is on the visible hemisphere of the globe.
 *
 * @param lat - Latitude of the marker
 * @param lon - Longitude of the marker
 * @param globeGroup - The globe's group object for applying rotation
 * @param globeRadius - Radius of the globe (default: 1)
 * @param markerRadius - Radius at which marker is positioned (default: 1.01)
 * @returns Object containing visibility state and opacity for smooth transitions
 */
export function useMarkerVisibility(
  lat: number,
  lon: number,
  globeGroup: THREE.Group | null,
  globeRadius: number = 1,
  markerRadius: number = 1.01
) {
  const { camera } = useThree();
  const [visibility, setVisibility] = useState({ isVisible: true, opacity: 1 });

  useEffect(() => {
    const updateVisibility = () => {
      // Convert lat/lon to 3D position (same as latLonToVector3)
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const markerPosition = new THREE.Vector3(
        -markerRadius * Math.sin(phi) * Math.cos(theta),
        markerRadius * Math.cos(phi),
        markerRadius * Math.sin(phi) * Math.sin(theta)
      );

      // Apply globe rotation
      const worldMarkerPosition = markerPosition.clone();
      if (globeGroup) {
        worldMarkerPosition.applyQuaternion(globeGroup.quaternion);
      }

      // Vector from globe center to marker (surface normal)
      const toMarker = worldMarkerPosition.clone().normalize();

      // Vector from globe center to camera
      const toCamera = camera.position.clone().normalize();

      // Dot product > 0 means marker faces camera (visible hemisphere)
      const dotProduct = toMarker.dot(toCamera);
      const isVisible = dotProduct > 0;

      // Calculate smooth opacity based on dot product
      // Fade out markers near the edge (dot product close to 0)
      const fadeThreshold = 0.1; // Start fading when dot product < 0.1
      const opacity = isVisible
        ? Math.min(1, Math.max(0, dotProduct / fadeThreshold))
        : 0;

      setVisibility({ isVisible, opacity });
    };

    // Update visibility immediately
    updateVisibility();

    let animationId: number;

    const animate = () => {
      updateVisibility();
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [lat, lon, globeGroup, globeRadius, markerRadius, camera]);

  return visibility;
}
