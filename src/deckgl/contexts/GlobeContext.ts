import { createContext } from 'react';
import type { GlobeViewState } from '@deck.gl/core';

export type RotationState = 'rotating' | 'paused' | 'stopped';

export const INITIAL_VIEW_STATE: GlobeViewState = {
  longitude: -70,
  latitude: 20,
  zoom: 2
};

interface DeckGLGlobeContextType {
  rotationState: RotationState;
  setRotationState: (state: RotationState) => void;
  viewState: GlobeViewState;
  setViewState: (viewState: GlobeViewState) => void;
  isInteracting: boolean;
  setIsInteracting: (interacting: boolean) => void;
}

export const DeckGLGlobeContext = createContext<DeckGLGlobeContextType>({
  rotationState: 'stopped',
  setRotationState: () => {},
  viewState: INITIAL_VIEW_STATE,
  setViewState: () => {},
  isInteracting: false,
  setIsInteracting: () => {}
});
