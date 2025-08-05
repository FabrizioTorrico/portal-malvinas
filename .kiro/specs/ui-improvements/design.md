# Design Document

## Overview

Este diseño implementa mejoras en la interfaz de usuario del Portal Malvinas, enfocándose en la consistencia de navegación, reorganización de rutas y mejoras en la experiencia de lectura. El diseño mantiene la funcionalidad existente mientras mejora la estructura y usabilidad.

## Architecture

### Current Structure

```
src/pages/
├── formulario-relato/index.astro
├── portal-memoria/
│   ├── index.astro
│   └── formulario.astro
└── relatos/
    ├── index.astro
    ├── lista.astro
    └── [...id].astro
```

### New Structure

```
src/pages/
├── portal-memoria/
│   ├── index.astro (with new button)
│   └── formulario.astro
└── relatos/
    ├── index.astro (updated links)
    ├── lista.astro
    ├── [...id].astro (with TOC title)
    └── formulario.astro
```

## Components and Interfaces

### 1. Portal Memoria Button Component

**Location:** Integrated into `PortalMemoriaGallery.tsx`

**Design:**

- Add button similar to the "Enviar Relato" button in relatos page
- Position: Next to the search input in the header section
- Style: Consistent with existing button design
- Link: Points to `/portal-memoria/formulario`

```tsx
// Button structure to add to PortalMemoriaGallery
<a href='/portal-memoria/formulario' className='h-full'>
  <div className='bg-secondary text-primary flex h-full w-max items-center justify-center rounded-xl p-1.5 px-3.5 font-medium'>
    Enviar Memoria
  </div>
</a>
```

### 2. Route Reorganization

**File Moves:**

- Move `src/pages/formulario-relato/index.astro` → `src/pages/relatos/formulario.astro`
- Update all internal links from `/formulario-relato` to `/relatos/formulario`

**Redirect Setup:**

- Create redirect from old route to new route for backward compatibility
- Update navigation components to use new routes

### 3. TOC Title Integration

**Target File:** `src/pages/relatos/[...id].astro`

**Implementation:**

- Identify the TOC generation logic
- Add title as first TOC element
- Ensure proper anchor linking
- Maintain existing TOC functionality

## Data Models

No new data models required. All existing Firebase data structures remain unchanged.

## Error Handling

### Button Integration

- Use the same button in relatos page in portal-memoria page
- Ensure button works in all viewport sizes
- Handle loading states appropriately
- Maintain accessibility standards

## Testing Strategy

### Manual Testing

1. **Portal Memoria Button:**

   - Verify button appears correctly on portal-memoria page
   - Test button click navigation to formulario
   - Verify responsive behavior

2. **Route Migration:**

   - Test old `/formulario-relato` redirects to new route
   - Verify all internal links updated correctly
   - Test direct access to new route

3. **TOC Integration:**
   - Verify title appears in TOC
   - Test title click navigation
   - Ensure other TOC elements still work

### Accessibility Testing

- Verify button has proper ARIA labels
- Test keyboard navigation
- Ensure screen reader compatibility

## Implementation Notes

### Phase 1: Portal Memoria Button

- Modify `PortalMemoriaGallery.tsx` to add button
- Test integration with existing layout
- Ensure responsive design

### Phase 2: Route Migration

- Create new file
- Move files and update imports
- Update all internal links
- Set up redirects

### Phase 3: TOC Enhancement

- Analyze current TOC implementation
- Add title as first TOC element
- Test navigation functionality

## Design Decisions

1. **Button Placement:** Place next to search input for consistency with relatos page
2. **Route Structure:** Use `/relato/formulario` instead of `/relatos/formulario` for singular consistency
3. **TOC Integration:** Add title as first element to maintain logical reading order
4. **Backward Compatibility:** Implement redirects to avoid breaking existing bookmarks
