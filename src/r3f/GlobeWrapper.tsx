import { useRef, useState, useCallback, useContext, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { GlobeContext } from './contexts/GlobeContext';
import { DEFAULT_GLOBE_RADIUS } from './Scene';

/** Auto-rotation speed in radians per second when not being dragged */
const AUTO_ROTATION_SPEED = 0.005;

/**
 * Props for the GlobeWrapper component
 */
interface GlobeWrapperProps {
  /** Child components to render inside the globe wrapper (typically Earth mesh) */
  children?: React.ReactNode;
  /** Speed of auto-rotation when not being dragged (default: AUTO_ROTATION_SPEED) */
  autoRotationSpeed?: number;
  /** Radius of the globe sphere for interaction calculations */
  radius?: number;
  /** Enable debug axis helpers for development/testing */
  debug?: boolean;
}

/**
 * Interactive 3D globe wrapper component that enables surface-based dragging interaction.
 *
 * This component provides sophisticated pointer event handling for a 3D globe, allowing users
 * to drag the globe naturally with the cursor staying "glued" to the surface point they clicked.
 * The interaction uses raycasting and quaternion mathematics to achieve realistic globe rotation.
 *
 * Key Features:
 * - True surface-based dragging using local space coordinates
 * - Quaternion-based rotation for smooth, gimbal-lock-free interaction
 * - Auto-rotation with pause/resume during user interaction
 * - Invisible sphere overlay for precise pointer event handling
 * - Configurable globe radius for different scales
 * - Edge case handling for off-globe dragging and poles
 *
 * Technical Implementation:
 * - Uses raycasting to find intersection points on the globe surface
 * - Converts world coordinates to local space for surface calculations
 * - Applies quaternion rotations to maintain smooth interaction
 * - Handles auto-rotation around Earth's polar axis (Y-axis)
 * - Includes debug axis helpers for development
 *
 * @example
 * ```tsx
 * <GlobeWrapper radius={1.5}>
 *   <Earth radius={1.5} />
 * </GlobeWrapper>
 * ```
 *
 * @param props - Configuration props for the globe wrapper
 * @param props.children - Child components to render inside the wrapper
 * @param props.autoRotationSpeed - Speed of auto-rotation when not being dragged (default: AUTO_ROTATION_SPEED)
 * @param props.radius - Globe radius for interaction calculations (default: 1)
 * @returns JSX element containing the interactive globe wrapper
 */
function GlobeWrapper({
  children,
  autoRotationSpeed = AUTO_ROTATION_SPEED,
  radius = DEFAULT_GLOBE_RADIUS,
  debug = false
}: GlobeWrapperProps) {
  /** Reference to the Three.js Group containing the globe */
  const ref = useRef<THREE.Group>(null);

  /** Three.js rendering context with camera, raycaster, and pointer */
  const { camera, raycaster, pointer } = useThree();

  /** Globe rotation state from context */
  const { rotationState, setRotationState, setGlobeGroup } =
    useContext(GlobeContext);

  /** The surface point (in local normalized coordinates) where the user grabbed the globe */
  const [grabbedPoint, setGrabbedPoint] = useState<THREE.Vector3 | null>(null);

  /** Initial quaternion state when drag began, used for relative rotation calculations */
  const [initialQuaternion, setInitialQuaternion] =
    useState<THREE.Quaternion | null>(null);

  /** Update the globe group in context when ref changes */
  useEffect(() => {
    setGlobeGroup(ref.current);
  }, [setGlobeGroup]);

  /** Handle auto-rotation resumption after dragging ends */
  useEffect(() => {
    if (rotationState === 'paused' && !grabbedPoint && !initialQuaternion) {
      // Resume rotation after a short delay
      const timer = setTimeout(() => {
        setRotationState('rotating');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [rotationState, grabbedPoint, initialQuaternion, setRotationState]);

  /**
   * Auto-rotation animation loop that continuously rotates the globe around its polar axis.
   * Only runs when the user is not actively dragging the globe.
   *
   * @param _state - React Three Fiber state (unused)
   * @param delta - Time elapsed since last frame in seconds
   */
  useFrame((_state, delta) => {
    if (ref.current && rotationState === 'rotating') {
      // Rotate around the Earth's own polar axis (local Y-axis)
      const earthPolarAxis = new THREE.Vector3(0, 1, 0);
      const rotationAmount = autoRotationSpeed * delta * 60;
      const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
        earthPolarAxis,
        rotationAmount
      );

      // Apply rotation to current quaternion
      const currentQuaternion = ref.current.quaternion.clone();
      currentQuaternion.multiply(rotationQuaternion);
      ref.current.setRotationFromQuaternion(currentQuaternion);
    }
  });

  /**
   * Handles pointer down events to initiate globe dragging.
   * Uses raycasting to find the exact surface point where the user clicked,
   * then stores this point for use during drag operations.
   *
   * @param event - Three.js pointer event containing event details
   */
  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      // Check if pointer is over the globe by raycasting to the group
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(ref.current!, true);

      // If we hit a marker, let it handle the event
      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        if (hitObject.userData?.isMarker) {
          // This is a marker, don't start dragging
          return;
        }

        event.stopPropagation();

        // Store the initial quaternion for relative rotation
        setInitialQuaternion(ref.current!.quaternion.clone());

        // Convert world point to local space and normalize for surface coordinates
        const worldPoint = intersects[0].point;
        const localPoint = ref.current!.worldToLocal(worldPoint.clone());
        const normalizedPoint = localPoint.normalize();

        // Store the grabbed point
        setGrabbedPoint(normalizedPoint);

        // Only pause if not manually stopped
        if (rotationState !== 'stopped') {
          setRotationState('paused');
        }
      }
    },
    [camera, raycaster, pointer, rotationState, setRotationState]
  );

  /**
   * Handles pointer move events during globe dragging.
   * Calculates the rotation needed to keep the grabbed surface point under the
   * cursor by using raycasting against a virtual sphere and quaternion
   * mathematics.
   */
  const handlePointerMove = useCallback(() => {
    if (!ref.current || !grabbedPoint || !initialQuaternion) return;

    // Cast ray from current mouse position to determine target location
    raycaster.setFromCamera(pointer, camera);

    // Create a virtual sphere at the globe's current position for raycasting
    const virtualSphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 8, 8),
      new THREE.MeshBasicMaterial()
    );
    virtualSphere.position.copy(ref.current.position);
    virtualSphere.quaternion.copy(initialQuaternion);

    const intersects = raycaster.intersectObject(virtualSphere, false);

    if (intersects.length > 0) {
      // Convert target world point to local space and normalize
      const targetWorldPoint = intersects[0].point;
      const targetLocalPoint = virtualSphere.worldToLocal(
        targetWorldPoint.clone()
      );
      const normalizedTarget = targetLocalPoint.normalize();

      // Calculate rotation to move grabbed point to target location
      const axis = new THREE.Vector3()
        .crossVectors(grabbedPoint, normalizedTarget)
        .normalize();

      const angle = grabbedPoint.angleTo(normalizedTarget);

      if (angle > 0.001 && axis.length() > 0) {
        // Apply rotation to the initial quaternion
        const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
          axis,
          angle
        );

        const newQuaternion = initialQuaternion.clone();
        newQuaternion.multiply(rotationQuaternion);
        ref.current.setRotationFromQuaternion(newQuaternion);
      }
    }
  }, [grabbedPoint, initialQuaternion, camera, raycaster, pointer, radius]);

  /**
   * Handles pointer up events to end globe dragging.
   * Cleans up drag state. Auto-rotation resumption is handled by useEffect.
   */
  const handlePointerUp = useCallback(() => {
    setGrabbedPoint(null); // Clean up stored point on drag end
    setInitialQuaternion(null); // Clean up initial quaternion
  }, []);

  return (
    <group ref={ref}>
      {children}

      {/* Invisible sphere overlay for pointer events */}
      <mesh
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Debug: Axis helpers to visualize globe orientation */}
      {debug && <axesHelper args={[2]} />}
    </group>
  );
}

export default GlobeWrapper;
