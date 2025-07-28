// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import { useMemo } from 'react';

import { DeckGL } from '@deck.gl/react';
import {
  COORDINATE_SYSTEM,
  _GlobeView as GlobeView,
  LightingEffect,
  AmbientLight,
  _SunLight as SunLight
} from '@deck.gl/core';
import { GeoJsonLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { SphereGeometry } from '@luma.gl/engine';

import type { GlobeViewState } from '@deck.gl/core';

const INITIAL_VIEW_STATE: GlobeViewState = {
  longitude: 0,
  latitude: 20,
  zoom: 2
};

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

export default function DeckGLGlobe() {
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
      new GeoJsonLayer({
        id: 'earth-land',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
        // Styles
        stroked: false,
        filled: true,
        opacity: 0.1,
        getFillColor: [30, 80, 120]
      })
    ],
    []
  );

  return (
    <>
      <DeckGL
        views={new GlobeView()}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        effects={[lightingEffect]}
        layers={[backgroundLayers]}
      />
    </>
  );
}
