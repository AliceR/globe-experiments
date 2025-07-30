import {
  LightingEffect,
  AmbientLight,
  _SunLight as SunLight
} from '@deck.gl/core';

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
export const lightingEffect = new LightingEffect({ ambientLight, sunLight });
