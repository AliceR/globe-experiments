import * as THREE from 'three';
import { latLonToVector3 } from './geo';
import type { RotationState } from '../contexts/GlobeContext';

/**
 * Focuses the globe so that the given lat/lon is in front of the camera.
 * Sets rotation state to stopped after click.
 * @param globeGroup The globe group (THREE.Group)
 * @param camera The camera (THREE.Camera)
 * @param lat Latitude
 * @param lon Longitude
 * @param setRotationState Callback to control rotation state
 */
export function focusGlobeOnLatLon({
  globeGroup,
  camera,
  lat,
  lon,
  setRotationState
}: {
  globeGroup: THREE.Group | null;
  camera: THREE.Camera;
  lat: number;
  lon: number;
  setRotationState?: (state: RotationState) => void;
}) {
  if (!globeGroup || !camera) return;

  // Stop auto-rotation immediately when marker is clicked
  if (setRotationState) {
    setRotationState('stopped');
  }

  // Marker position in world space (on unit sphere)
  const markerVec = latLonToVector3(lat, lon, 1).normalize();

  // Camera direction in world space (from globe center to camera)
  const cameraPos = new THREE.Vector3();
  camera.getWorldPosition(cameraPos);
  const cameraDir = cameraPos.clone().normalize();

  // Step 1: Rotate markerVec to cameraDir
  const q1 = new THREE.Quaternion().setFromUnitVectors(markerVec, cameraDir);

  // Step 2: Find the rotation around cameraDir that brings globe's Y as close as possible to world up
  // Globe's Y after q1
  const yAfterQ1 = new THREE.Vector3(0, 1, 0).applyQuaternion(q1);
  // Project yAfterQ1 and worldUp onto the plane perpendicular to cameraDir
  const worldUp = new THREE.Vector3(0, 1, 0);
  const yProj = yAfterQ1.clone().projectOnPlane(cameraDir).normalize();
  const upProj = worldUp.clone().projectOnPlane(cameraDir).normalize();
  // Angle between them
  let angle = Math.acos(Math.max(-1, Math.min(1, yProj.dot(upProj))));
  // Determine direction
  const cross = new THREE.Vector3().crossVectors(yProj, upProj);
  if (cross.dot(cameraDir) < 0) angle = -angle;
  // Rotation around cameraDir
  const q2 = new THREE.Quaternion().setFromAxisAngle(cameraDir, angle);

  // Final target quaternion
  const targetQ = q2.multiply(q1);

  // Animate the rotation (fly-to effect)
  const duration = 0.8; // seconds
  const startQ = globeGroup.quaternion.clone();
  let start: number | null = null;

  function animate(time: number) {
    if (start === null) start = time;
    const t = Math.min((time - start) / (duration * 1000), 1);
    if (globeGroup) {
      globeGroup.quaternion.copy(startQ).slerp(targetQ, t);
    }
    if (t < 1) {
      requestAnimationFrame(animate);
    } else if (globeGroup) {
      globeGroup.setRotationFromQuaternion(targetQ);
    }
  }
  requestAnimationFrame(animate);
}
