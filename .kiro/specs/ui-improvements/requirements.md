# Requirements Document

## Introduction

Este spec implementa mejoras en la interfaz de usuario del Portal Malvinas, específicamente reorganizando la estructura de rutas y mejorando la navegación entre formularios y páginas de contenido.

## Requirements

### Requirement 1

**User Story:** Como usuario del portal, quiero poder acceder fácilmente al formulario de portal de memoria desde la página principal del portal de memoria, para poder enviar mi contribución de manera intuitiva.

#### Acceptance Criteria

1. WHEN un usuario visita la página `/portal-memoria` THEN debe ver un botón "Enviar Memoria" similar al botón "Enviar Relato" de la página de relatos
2. WHEN el usuario hace clic en el botón "Enviar Memoria" THEN debe ser redirigido a `/portal-memoria/formulario`
3. WHEN el usuario accede al formulario THEN debe mantener la misma funcionalidad existente

### Requirement 2

**User Story:** Como desarrollador del portal, quiero reorganizar la estructura de rutas para que sea más consistente y lógica, moviendo el formulario de relatos a una ubicación más apropiada.

#### Acceptance Criteria

1. WHEN se accede a `/relato/formulario` THEN debe mostrar el formulario de envío de relatos
2. WHEN se accede a la antigua ruta `/formulario-relato` THEN debe redirigir a `/relato/formulario`
3. WHEN se actualicen las rutas THEN todos los enlaces internos deben apuntar a la nueva ubicación
4. WHEN se mueva el formulario THEN debe mantener toda su funcionalidad existente

### Requirement 3

**User Story:** Como lector de relatos, quiero que el título del relato aparezca en la tabla de contenidos (TOC) para poder navegar más fácilmente por el contenido.

#### Acceptance Criteria

1. WHEN un usuario lee un relato individual THEN el título debe aparecer como elemento del TOC
2. WHEN el usuario hace clic en el título en el TOC THEN debe navegar al inicio del relato
3. WHEN se genere el TOC THEN el título debe aparecer como el primer elemento
4. WHEN se muestre el TOC THEN debe mantener la funcionalidad existente para otros elementos
