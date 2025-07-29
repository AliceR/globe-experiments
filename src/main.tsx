import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Enable axe-core accessibility testing in development mode
if (process.env.NODE_ENV === 'development') {
  void import('@axe-core/react')
    .then((axe) => {
      // Initialize axe-core with React and ReactDOM
      // The third parameter (1000) is the debounce delay in milliseconds
      void axe.default(React, ReactDOM, 1000);
      console.log(
        '🔍 Axe-core accessibility testing enabled! Check console for violations.'
      );
    })
    .catch((error) => {
      console.warn('Failed to load axe-core for accessibility testing:', error);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
