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
import { DeckGlobeOverlayLayerSelector } from './DeckGlobeOverlayLayerSelector';
import {
  backgroundLayers,
  dataLayers,
  markerLayers,
  type VedaTileLayer
} from './layers';
import { fetchVedaLayers, getVedaLayerTileUrl } from '../data/fetchVedaLayers';
import type { VedaLayer } from '../data/fetchVedaLayers';
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
  const pausedTimeoutRef = useRef<number>(0);

  // Track if a marker is hovered
  const [isMarkerHovered, setIsMarkerHovered] = useState(false);

  // VEDA layer selection state
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [allVedaCollections, setAllVedaCollections] = useState<VedaLayer[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vedaError, setVedaError] = useState<string | null>(null);

  // Fetch all VEDA layers on mount
  useEffect(() => {
    fetchVedaLayers()
      .then((layers) => {
        setAllVedaCollections(layers);
      })
      .catch((err) => {
        setVedaError(err instanceof Error ? err.message : String(err));
      });
  }, []);

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

  useEffect(() => {
    // Pause rotation when marker is hovered, resume after 1s when not hovered
    if (isMarkerHovered) {
      if (rotationState === 'rotating') {
        setRotationState('paused');
      }
      // Clear any pending resume timeout if hovering again
      if (pausedTimeoutRef.current) {
        clearTimeout(pausedTimeoutRef.current);
        pausedTimeoutRef.current = 0;
      }
    } else {
      if (rotationState === 'paused' && !pausedTimeoutRef.current) {
        pausedTimeoutRef.current = setTimeout(() => {
          setRotationState('rotating');
          pausedTimeoutRef.current = 0;
        }, 1000) as unknown as number;
      }
    }

    return () => {
      if (pausedTimeoutRef.current) {
        clearTimeout(pausedTimeoutRef.current);
        pausedTimeoutRef.current = 0;
      }
    };
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

  // Store selected VEDA tile layers in state
  const [selectedTileLayers, setSelectedTileLayers] = useState<VedaTileLayer[]>(
    []
  );

  useEffect(() => {
    let isMounted = true;
    const fetchTileLayers = async () => {
      const layers = await Promise.all(
        selectedLayerIds.map(async (id) => {
          const layer = allVedaCollections.find((l) => l.id === id);
          if (layer) {
            console.log(layer);
            const urlFunc = await getVedaLayerTileUrl(layer.id, layer.renders);
            console.log(urlFunc);
            return {
              ...layer,
              getUrl: urlFunc
            } as unknown as VedaTileLayer;
          }
          return undefined;
        })
      );
      if (isMounted) {
        setSelectedTileLayers(
          layers.filter((x): x is NonNullable<typeof x> => x !== undefined)
        );
      }
    };
    void fetchTileLayers();
    return () => {
      isMounted = false;
    };
  }, [selectedLayerIds, allVedaCollections]);

  const memoizedDataLayers = useMemo(
    () => dataLayers(selectedTileLayers),
    [selectedTileLayers]
  );

  const memoizedMarkerLayers = useMemo(
    () => markerLayers(handleMarkerClick, rotationState, setIsMarkerHovered),
    [handleMarkerClick, rotationState, setIsMarkerHovered]
  );

  return (
    <>
      <DeckGlobeOverlayLayerSelector
        value={selectedLayerIds}
        onChange={setSelectedLayerIds}
        layers={allVedaCollections}
      />
      <DeckGL
        views={new GlobeView()}
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        onInteractionStateChange={handleInteractionStateChange}
        controller={true}
        effects={[lightingEffect]}
        layers={[
          ...memoizedBackgroundLayers,
          ...memoizedDataLayers,
          ...memoizedMarkerLayers
        ]}
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
