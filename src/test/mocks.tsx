import { vi } from 'vitest';
import type { ReactNode } from 'react';

// Mock the 3D globe components to prevent complex rendering
vi.mock('../r3f', () => ({
  default: () => <div data-testid='r3f-globe'>R3F Globe Mock</div>
}));

// Mock Three.js and React Three Fiber
vi.mock('three', () => {
  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    clone() {
      return new Vector3(this.x, this.y, this.z);
    }
    applyQuaternion() {
      return this;
    }
    normalize() {
      return this;
    }
    dot() {
      return 1;
    }
  }
  class Quaternion {
    clone() {
      return new Quaternion();
    }
  }
  class Group {
    quaternion: Quaternion;
    constructor() {
      this.quaternion = new Quaternion();
    }
  }
  // Attach to a single object for both named and default
  const three = {
    Vector3,
    Group,
    Quaternion
  };
  return new Proxy(three, {
    get(target, prop) {
      // Support both named and default exports
      if (prop === 'default') return target;
      return target[prop as keyof typeof target];
    }
  });
});

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: { children: ReactNode }) => (
    <div data-testid='canvas' {...props}>
      {children}
    </div>
  ),
  useThree: () => ({
    camera: {
      position: {
        clone: () => ({
          x: 0,
          y: 0,
          z: 3,
          normalize: () => ({ x: 0, y: 0, z: 3 })
        })
      }
    },
    raycaster: {},
    pointer: {}
  }),
  useFrame: () => {}
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid='orbit-controls' />,
  Stats: () => <div data-testid='stats' />,
  useTexture: () => ['/mock.png', '/mock.png']
}));

vi.mock('leva', () => ({
  useControls: () => ({
    rotationSpeed: 0.01,
    wireframe: false
  })
}));
