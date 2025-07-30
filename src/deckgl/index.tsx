import {
  useMemo,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import { DeckGL } from '@deck.gl/react';
import { _GlobeView as GlobeView } from '@deck.gl/core';

import type { GlobeViewState, PickingInfo } from '@deck.gl/core';
import { DeckGLGlobeContext } from './contexts/GlobeContext';
import { DeckGLGlobeProvider } from './contexts/GlobeProvider';
import { RotationControlButton } from '../components/RotationControlButton';
import { backgroundLayers, dataLayers } from './layers';
import { lightingEffect } from './lighting';
import type { MarkerData } from './types';
import { getTooltip } from './tooltip';

function DeckGLGlobeInner() {
  const {
    rotationState,
    setRotationState,
    viewState,
    setViewState,
    isInteracting,
    setIsInteracting
  } = useContext(DeckGLGlobeContext);

  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Track if a marker is hovered
  const [isMarkerHovered, setIsMarkerHovered] = useState(false);

  // Auto-rotation logic
  useEffect(() => {
    const animate = (time: number) => {
      if (rotationState === 'rotating' && !isInteracting) {
        const deltaTime = time - lastTimeRef.current;
        if (deltaTime > 16) {
          // ~60fps
          setViewState({
            ...viewState,
            longitude: (viewState.longitude - 0.3) % 360
          });
          lastTimeRef.current = time;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rotationState, isInteracting, viewState, setViewState]);

  // Pause rotation when marker is hovered, resume when not hovered
  useEffect(() => {
    if (isMarkerHovered && rotationState === 'rotating') {
      setRotationState('paused');
    } else if (!isMarkerHovered && rotationState === 'paused') {
      setRotationState('rotating');
    }
  }, [isMarkerHovered, rotationState, setRotationState]);

  // Handle marker click to focus on location
  const handleMarkerClick = useCallback(
    (info: PickingInfo<MarkerData>) => {
      if (info.object && info.object.lat && info.object.lon) {
        const { lat, lon } = info.object;

        // Stop rotation immediately when marker is clicked
        setRotationState('stopped');

        // Animate to the marker location
        setViewState({
          ...viewState,
          latitude: lat,
          longitude: lon,
          zoom: Math.max(viewState.zoom, 4), // Zoom in if not already zoomed
          transitionDuration: 1500
        });
      }
    },
    [viewState, setViewState, setRotationState]
  );

  // Handle controller interaction
  const handleViewStateChange = useCallback(
    ({ viewState: newViewState }: { viewState: GlobeViewState }) => {
      setViewState(newViewState);
    },
    [setViewState]
  );

  const handleInteractionStateChange = useCallback(
    (info: {
      isDragging?: boolean;
      isPanning?: boolean;
      isRotating?: boolean;
      isZooming?: boolean;
      inTransition?: boolean;
    }) => {
      const { isDragging } = info;
      setIsInteracting(isDragging ?? false);

      // Pause rotation when user starts interacting
      if (isDragging && rotationState === 'rotating') {
        setRotationState('paused');
      }
      // Resume rotation after 3 seconds of no interaction
      else if (!isDragging && rotationState === 'paused') {
        setTimeout(() => {
          setRotationState('rotating');
        }, 3000);
      }
    },
    [rotationState, setRotationState, setIsInteracting]
  );

  const memoizedBackgroundLayers = useMemo(() => backgroundLayers, []);

  const memoizedDataLayers = useMemo(
    () => dataLayers(handleMarkerClick, rotationState, setIsMarkerHovered),
    [handleMarkerClick, rotationState, setIsMarkerHovered]
  );

  return (
    <>
      <DeckGL
        views={new GlobeView()}
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        onInteractionStateChange={handleInteractionStateChange}
        controller={true}
        effects={[lightingEffect]}
        layers={[...memoizedBackgroundLayers, ...memoizedDataLayers]}
        getCursor={({ isDragging }) =>
          isMarkerHovered ? 'pointer' : isDragging ? 'grabbing' : 'grab'
        }
        getTooltip={getTooltip('markers-layer')}
      />
      <RotationControlButton
        rotationState={rotationState}
        setRotationState={setRotationState}
      />
    </>
  );
}

export default function DeckGLGlobe() {
  return (
    <DeckGLGlobeProvider>
      <DeckGLGlobeInner />
    </DeckGLGlobeProvider>
  );
}
