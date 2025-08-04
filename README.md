# Globe Experiments

🌍 Interactive 3D globe comparing DeckGL and React Three Fiber (R3F) implementations.

## Features

- **3D Library Comparison**: Side-by-side comparison of DeckGL and R3F globe rendering with tabbed interface
- **Interactive 3D Scene**: Mouse controls for rotation, zoom, and pan
- **Globe Animation**: Automatic rotation around polar axis with pause/resume controls
- **Interactive Markers**: Clickable location markers on the globe surface
- **Data Visualization**: Tile layer overlays with VEDA geospatial data (<https://openveda.cloud/>)
- **Responsive Design**: Full-screen 3D canvas with overlay UI

## Development Setup

This project uses Vite + React + TypeScript.

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run lint` - Run ESLint + Stylelint (includes Prettier formatting checks)
- `pnpm run lint:fix` - Auto-fix ESLint + Stylelint and Prettier issues
- `pnpm run test` - Run tests in watch mode
- `pnpm run test:run` - Run tests once
- `pnpm run check` - Run both linting and formatting checks

### Code Quality

ESLint is configured with Prettier integration, Stylelint for CSS, and TypeScript type-aware rules:

- **Type-aware linting**: Catches TypeScript-specific issues and type errors
- **CSS linting**: Stylelint catches CSS syntax errors and enforces best practices
- **Prettier integration**: Formatting rules are enforced as ESLint errors
- **Git hooks**: Pre-commit runs linting (`pnpm run lint`), pre-push runs tests (`pnpm run test:run`)
- **Auto-fix**: `pnpm run lint:fix` fixes both linting and formatting issues
- **Accessibility testing**: Axe-core automatically logs accessibility violations in development mode browser console

### 3D Libraries

**React Three Fiber (R3F) Implementation:**

- **Three.js**: Core 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Helper components and utilities
- **Leva**: Real-time controls for development and debugging

**DeckGL Implementation:**

- **DeckGL**: High-performance WebGL-based geospatial data visualization framework

---

*Built with React + TypeScript + Vite and AI assistance* <!-- markdownlint-disable-line MD036 -->
