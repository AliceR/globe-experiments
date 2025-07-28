import {
  useMemo,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import { DeckGL } from '@deck.gl/react';
import {
  COORDINATE_SYSTEM,
  _GlobeView as GlobeView,
  LightingEffect,
  AmbientLight,
  _SunLight as SunLight
} from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { SphereGeometry } from '@luma.gl/engine';

import type { GlobeViewState, LayerProps, PickingInfo } from '@deck.gl/core';
import { DeckGLGlobeContext } from './contexts/GlobeContext';
import { DeckGLGlobeProvider } from './contexts/GlobeProvider';
import { RotationControlButton } from '../components/RotationControlButton';
import { markers } from '../data/markers';
import { getTileUrl } from '../r3f/utils/tiles';

// Type definitions for our data
interface MarkerData {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

const EARTH_RADIUS_METERS = 6.3e6;

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.5
});
const sunLight = new SunLight({
  color: [255, 255, 255],
  intensity: 2.0,
  timestamp: 0
});
// create lighting effect with light sources
const lightingEffect = new LightingEffect({ ambientLight, sunLight });

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
            longitude: (viewState.longitude + 0.1) % 360
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

  const backgroundLayers = useMemo(
    () => [
      new SimpleMeshLayer({
        id: 'earth-sphere',
        data: [0],
        mesh: new SphereGeometry({
          radius: EARTH_RADIUS_METERS,
          nlat: 18,
          nlong: 36
        }),
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: [0, 0, 0],
        getColor: [255, 255, 255]
      }),

      // Earth coastline layer
      new GeoJsonLayer({
        id: 'coastline',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_coastline.geojson',
        // Styles
        stroked: true,
        filled: false,
        opacity: 1.0,
        getLineColor: [30, 80, 120, 255],
        getLineWidth: 1,
        lineWidthUnits: 'pixels',
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 3
      })
    ],
    []
  );

  const dataLayers = useMemo(
    () => [
      // Tile layer with VEDA data
      new TileLayer({
        id: 'veda-tile-layer',
        getTileData: ({
          index
        }: {
          index: { x: number; y: number; z: number };
        }) => {
          const { x, y, z } = index;
          const url = getTileUrl(x, y, z);
          return fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
              return new Promise<HTMLImageElement>((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = URL.createObjectURL(blob);
              });
            });
        },
        maxZoom: 4,
        minZoom: 0,
        tileSize: 256,
        renderSubLayers: (
          props: LayerProps & {
            tile: { boundingBox: [number[], number[]] };
            data: HTMLImageElement;
          }
        ) => {
          const { tile, data } = props;
          const { boundingBox } = tile;
          return new BitmapLayer({
            ...props,
            data: undefined,
            image: data,
            bounds: [
              boundingBox[0][0], // west
              boundingBox[0][1], // south
              boundingBox[1][0], // east
              boundingBox[1][1] // north
            ]
          });
        }
      }),

      // Markers layer
      new ScatterplotLayer({
        id: 'markers-layer',
        data: markers,
        getPosition: (marker: MarkerData) => [marker.lon, marker.lat, 0],
        getRadius: 50000, // radius in meters
        getFillColor: [255, 100, 100, 200],
        getLineColor: [255, 255, 255],
        getLineWidth: 10000,
        radiusMinPixels: 5,
        radiusMaxPixels: 15,
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 3,
        stroked: true,
        filled: true,
        pickable: true,
        onClick: handleMarkerClick,
        onHover: (info) => {
          setIsMarkerHovered(!!info.object);
        },
        updateTriggers: {
          getRadius: rotationState // Re-render when rotation state changes for hover effects
        }
      })
    ],
    [handleMarkerClick, rotationState]
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
        layers={[...backgroundLayers, ...dataLayers]}
        getCursor={({ isHovering }) => {
          if (isMarkerHovered) {
            return 'pointer';
          }
          return isHovering ? 'grab' : 'default';
        }}
        getTooltip={(info) => {
          const { object, layer } = info as {
            object: MarkerData | null;
            layer: { id: string } | null;
          };
          if (layer?.id === 'markers-layer' && object) {
            return {
              html: `<div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px;">
                <strong>${object.name}</strong><br/>
                Lat: ${object.lat.toFixed(4)}<br/>
                Lon: ${object.lon.toFixed(4)}
              </div>`,
              style: {
                fontSize: '12px',
                pointerEvents: 'none'
              }
            };
          }
          return null;
        }}
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
