import { createContext } from 'react';
import type { GlobeViewState } from '@deck.gl/core';

export type RotationState = 'rotating' | 'paused' | 'stopped';

interface DeckGLGlobeContextType {
  rotationState: RotationState;
  setRotationState: (state: RotationState) => void;
  viewState: GlobeViewState;
  setViewState: (viewState: GlobeViewState) => void;
  isInteracting: boolean;
  setIsInteracting: (interacting: boolean) => void;
}

export const DeckGLGlobeContext = createContext<DeckGLGlobeContextType>({
  rotationState: 'rotating',
  setRotationState: () => {},
  viewState: { longitude: 0, latitude: 20, zoom: 2 },
  setViewState: () => {},
  isInteracting: false,
  setIsInteracting: () => {}
});
