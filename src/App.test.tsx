import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from './App';

describe('App', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders Earth Information Explorer heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', {
      name: /earth information explorer/i
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
