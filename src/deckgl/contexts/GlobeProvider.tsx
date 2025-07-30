import React, { useState, useCallback, type ReactNode } from 'react';
import type { GlobeViewState } from '@deck.gl/core';
import {
  DeckGLGlobeContext,
  INITIAL_VIEW_STATE,
  type RotationState
} from './GlobeContext';

export const DeckGLGlobeProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [rotationState, setRotationState] = useState<RotationState>('rotating');
  const [viewState, setViewState] =
    useState<GlobeViewState>(INITIAL_VIEW_STATE);
  const [isInteracting, setIsInteracting] = useState(false);

  const handleSetViewState = useCallback((newViewState: GlobeViewState) => {
    setViewState(newViewState);
  }, []);

  const handleSetRotationState = useCallback((state: RotationState) => {
    setRotationState(state);
  }, []);

  const handleSetIsInteracting = useCallback((interacting: boolean) => {
    setIsInteracting(interacting);
  }, []);

  return (
    <DeckGLGlobeContext.Provider
      value={{
        rotationState,
        setRotationState: handleSetRotationState,
        viewState,
        setViewState: handleSetViewState,
        isInteracting,
        setIsInteracting: handleSetIsInteracting
      }}
    >
      {children}
    </DeckGLGlobeContext.Provider>
  );
};
