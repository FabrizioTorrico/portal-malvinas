# Project Structure & Organization

## Root Directory Layout
```
├── .astro/              # Astro build artifacts and type definitions
├── .kiro/               # Kiro AI assistant configuration
├── packages/            # Monorepo workspace packages
│   └── pure/           # Custom astro-pure theme package
├── public/             # Static assets served directly
├── src/                # Source code and content
└── dist/               # Production build output
```

## Source Directory (`src/`)
```
src/
├── assets/             # Processed assets (images, etc.)
├── components/         # Reusable UI components
│   ├── about/         # About page components
│   ├── formularios-relato/ # Story form components
│   ├── home/          # Homepage components
│   ├── links/         # Link-related components
│   ├── projects/      # Project components
│   ├── relatos/       # Story/testimonial components
│   └── BaseHead.astro # Common head component
├── content/           # Content collections
│   ├── blog/         # Blog posts (Markdown/MDX)
│   └── docs/         # Documentation (Markdown/MDX)
├── layouts/          # Page layout components
├── pages/            # File-based routing
├── plugins/          # Custom Astro plugins
├── content.config.ts # Content collection schemas
├── site.config.ts    # Site configuration
└── type.d.ts         # Global type definitions
```

## Public Directory (`public/`)
```
public/
├── favicon/          # Favicon variants
├── fonts/           # Font files
├── icons/           # Icon assets
├── images/          # Static images
├── scripts/         # Client-side scripts
├── styles/          # Global stylesheets
└── links.json       # Links data
```

## Configuration Files
- `astro.config.mjs` - Main Astro configuration
- `src/site.config.ts` - Site-specific settings and theme config
- `src/content.config.ts` - Content collection schemas
- `tsconfig.json` - TypeScript configuration with path aliases
- `uno.config.ts` - UnoCSS configuration
- `tailwind.config.mjs` - Tailwind CSS configuration

## Path Aliases (TypeScript)
```typescript
"@/assets/*": ["src/assets/*"]
"@/components/*": ["src/components/*"]
"@/layouts/*": ["src/layouts/*"]
"@/utils": ["src/utils/index.ts"]
"@/utils/*": ["src/utils/*"]
"@/plugins/*": ["src/plugins/*"]
"@/pages/*": ["src/pages/*"]
"@/types": ["src/types/index.ts"]
"@/site-config": ["src/site.config.ts"]
```

## Content Organization
- **Blog Collection**: Stories and articles in `src/content/blog/`
- **Docs Collection**: Documentation in `src/content/docs/`
- **Content Schema**: Defined in `src/content.config.ts` with Zod validation
- **Frontmatter**: Required fields include title, description, publishDate
- **Tags**: Automatically normalized to lowercase and deduplicated

## Component Architecture
- **Feature-based**: Components organized by feature/page (home, relatos, etc.)
- **Astro Components**: Primary component format (.astro files)
- **React Integration**: Available for interactive components
- **Shared Components**: Common components in root of components directory

## Asset Management
- **Static Assets**: Place in `public/` for direct serving
- **Processed Assets**: Place in `src/assets/` for optimization
- **Images**: Automatically optimized via Sharp
- **Fonts**: Variable fonts loaded via @fontsource packages

## Styling Organization
- **UnoCSS**: Atomic utility classes with custom theme
- **Component Styles**: Scoped styles within .astro components
- **Global Styles**: Typography and theme variables
- **CSS Custom Properties**: Theme colors via HSL variables