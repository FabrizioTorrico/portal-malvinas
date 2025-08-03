# Tech Stack & Build System

## Core Framework
- **Astro 5.8+**: Static site generator with server-side rendering capabilities
- **React**: Component library integration via @astrojs/react
- **TypeScript**: Strict TypeScript configuration with JSX support

## Styling & UI
- **UnoCSS**: Atomic CSS framework with Wind3 preset
- **Tailwind CSS**: Additional utility classes (configured alongside UnoCSS)
- **Typography**: UnoCSS typography preset for content styling
- **Fonts**: Montserrat and Roboto variable fonts via @fontsource

## Content Management
- **Astro Content Collections**: Type-safe content management
- **MDX**: Enhanced Markdown with component support
- **Math Support**: KaTeX for mathematical expressions via remark-math/rehype-katex
- **Syntax Highlighting**: Shiki with custom transformers

## Key Libraries
- **astro-pure**: Custom theme/integration (workspace package)
- **@blocknote/react**: Rich text editor components
- **@waline/client**: Comment system
- **marked**: Markdown parser
- **sharp**: Image optimization

## Development Tools
- **Bun**: Package manager and runtime
- **ESLint**: Code linting with Astro plugin
- **Prettier**: Code formatting with import sorting
- **TypeScript**: Type checking

## Deployment
- **Vercel**: Primary deployment target with serverless adapter
- **Server Output**: Configured for server-side rendering

## Common Commands

### Development
```bash
bun install          # Install dependencies
bun dev             # Start development server
bun dev:check       # Development with type checking
```

### Build & Deploy
```bash
bun build           # Production build with checks
bun preview         # Preview production build
bun sync            # Sync Astro types
bun check           # Type checking
```

### Code Quality
```bash
bun format          # Format code with Prettier
bun lint            # Lint and fix code
bun yijiansilian    # Run all quality checks (lint, sync, check, format)
```

### Content Management
```bash
bun new             # Create new content (via astro-pure)
bun pure            # Access astro-pure CLI
```

### Maintenance
```bash
bun clean           # Remove build artifacts (.astro, .vercel, dist)
```

## Monorepo Structure
- Workspace configuration with `packages/*` pattern
- Custom `astro-pure` package in `packages/pure/`
- Shared components and utilities across workspace