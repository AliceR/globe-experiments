import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import App from './App';

// Mock Three.js and React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: { children: ReactNode }) => (
    <div data-testid='canvas' {...props}>
      {children}
    </div>
  )
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid='orbit-controls' />,
  Stats: () => <div data-testid='stats' />
}));

vi.mock('leva', () => ({
  useControls: () => ({
    rotationSpeed: 0.01,
    wireframe: false
  })
}));

describe('App', () => {
  it('renders Earth Information Explorer heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', {
      name: /earth information explorer/i
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders dashboard description', () => {
    render(<App />);
    const description = screen.getByText(
      /interactive 3d geospatial dashboard/i
    );
    expect(description).toBeInTheDocument();
  });

  it('renders canvas container', () => {
    render(<App />);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('main');
  });

  it('renders 3D canvas', () => {
    render(<App />);
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders with proper app structure', () => {
    render(<App />);
    const app = document.querySelector('.app');
    expect(app).toBeInTheDocument();
  });
});
