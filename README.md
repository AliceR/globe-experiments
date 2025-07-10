# Earth Information Explorer

🌍 Interactive 3D geospatial dashboard with dynamic data visualization.

## Development Setup

This project uses Vite + React + TypeScript with integrated ESLint and Prettier.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint (includes Prettier formatting checks)
- `npm run fix` - Auto-fix ESLint and Prettier issues
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run check` - Run both linting and formatting checks

### Code Quality

ESLint is configured with Prettier integration and TypeScript type-aware rules:

- **Type-aware linting**: Catches TypeScript-specific issues and type errors
- **Prettier integration**: Formatting rules are enforced as ESLint errors
- **Git hooks**: Pre-commit runs linting, pre-push runs tests
- **Auto-fix**: `npm run lint:fix` fixes both linting and formatting issues

### Git Hooks

- **Pre-commit**: Runs `npm run lint` to catch code quality issues
- **Pre-push**: Runs `npm run test:run` to ensure tests pass

---

*Built with React + TypeScript + Vite* <!-- markdownlint-disable-line MD036 -->
