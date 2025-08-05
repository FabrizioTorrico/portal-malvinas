# Implementation Plan

- [x] 1. Add "Enviar Memoria" button to Portal Memoria page

  - Modify `PortalMemoriaGallery.tsx` to include button similar to relatos page
  - Position button next to search input in header section
  - Ensure responsive design and accessibility
  - _Requirements: 1.1, 1.2_

- [x] 2. Create new route structure for relato formulario

  - Create `src/pages/relatos/formulario.astro` directory and file
  - Copy content from existing `src/pages/formulario-relato/index.astro`
  - Update any component imports if necessary
  - _Requirements: 2.1_

- [x] 3. Update internal links to use new relato formulario route

  - Update link in `RelatosMainContentFirebase.tsx` from `/formulario-relato` to `/relato/formulario`
  - Search for any other internal references to old route
  - Update navigation components if they exist
  - _Requirements: 2.3_

- [x] 4. Set up redirect from old formulario-relato route

  - Modify or create redirect in `src/pages/formulario-relato/index.astro`
  - Implement proper HTTP redirect to new route
  - Ensure SEO-friendly redirect (301)
  - _Requirements: 2.2_

- [x] 5. Implement TOC title integration for relatos

  - Analyze current TOC implementation in relatos detail page
  - Identify where TOC is generated in `src/pages/relatos/[...id].astro`
  - Add relato title as first TOC element with proper anchor
  - Test navigation functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.4_
