# Earth Information Explorer

🌍 Interactive 3D geospatial dashboard with dynamic data visualization.

## Features

- **Interactive 3D Scene**: Mouse controls for rotation, zoom, and pan
- **Real-time Controls**: Leva panel for adjusting scene parameters
- **Performance Monitoring**: Built-in stats display
- **Responsive Design**: Full-screen 3D canvas with overlay UI

## Development Setup

This project uses Vite + React + TypeScript with Three.js for 3D visualization.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint + Stylelint (includes Prettier formatting checks)
- `npm run lint:fix` - Auto-fix ESLint + Stylelint and Prettier issues
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run check` - Run both linting and formatting checks

### Code Quality

ESLint is configured with Prettier integration, Stylelint for CSS, and TypeScript type-aware rules:

- **Type-aware linting**: Catches TypeScript-specific issues and type errors
- **CSS linting**: Stylelint catches CSS syntax errors and enforces best practices
- **Prettier integration**: Formatting rules are enforced as ESLint errors
- **Git hooks**: Pre-commit runs linting (`npm run lint`), pre-push runs tests (`npm run test:run`)
- **Auto-fix**: `npm run lint:fix` fixes both linting and formatting issues
- **Accessibility testing**: Axe-core automatically logs accessibility violations in development mode browser console

### 3D Libraries

- **Three.js**: Core 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Helper components and utilities
- **Leva**: Real-time controls for development and debugging

---

*Built with React + TypeScript + Vite* <!-- markdownlint-disable-line MD036 -->
