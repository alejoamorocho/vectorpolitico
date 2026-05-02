# Rediseño UX del Compass Político

**Fecha:** 2026-04-15
**Estado:** Aprobado
**Alcance:** Componente compass (mapa político interactivo), traducciones de cargos, experiencia de scroll y fullscreen.

---

## Contexto

El compass actual muestra todos los elementos al cargar (puntos autopercibidos, evidenciados, flechas, elipses de confianza) lo cual resulta visualmente desorganizado. Los filtros solo aparecen al expandir. El scroll de la página se captura involuntariamente por el zoom del mapa. Los cargos políticos se muestran en inglés en algunos lugares. Las elipses de confianza no aportan valor visual.

## Decisiones de diseño

### 1. Estado inicial — Solo grid de ideologías

Al cargar la página, el mapa muestra únicamente:
- El grid de celdas de ideología (treemap) con sus nombres
- Los ejes (Izquierda↔Derecha, Autoritario↔Libertario)
- Los cuadrantes con sus colores

**No se muestran** al inicio: puntos, líneas, flechas ni elipses. El usuario activa capas desde el sidebar.

### 2. Panel lateral fijo (sidebar) — Siempre visible

El sidebar se muestra junto al mapa tanto en modo embebido como en fullscreen. Contiene tres secciones:

#### Capas (checkboxes, todas OFF por defecto)
- **Autopercibido** — punto azul (`#1e3556`), "Dónde dice estar"
- **Evidenciado** — punto rojo (`#6b1f1f`), "Dónde está realmente"
- **Flechas** — línea gris que conecta autopercibido → evidenciado

Al activar una capa, los elementos correspondientes aparecen en el mapa para todas las entidades visibles según los filtros.

#### Filtros (dropdowns)
- **Cargo** — opciones en español: Todos, Presidentes, Candidatos, Senadores, Representantes, Gobernadores, Alcaldes
- **Partido** — lista dinámica de partidos presentes en los datos

#### Guía (leyenda explicativa, siempre visible)
- Punto azul → "Dónde dice estar"
- Punto rojo → "Dónde está realmente"
- Línea con flecha → "Distancia discurso ↔ acción"

La guía solo muestra los elementos que corresponden a las capas activas.

#### Responsividad
- **Desktop (≥1024px):** sidebar fijo a la izquierda, ancho ~180px
- **Tablet (640–1023px):** sidebar colapsable, se muestra como drawer lateral
- **Móvil (<640px):** sidebar se colapsa debajo del mapa como drawer inferior

### 3. Scroll — Ctrl+scroll para zoom

**Problema:** Al hacer scroll en la página, el mapa captura el evento wheel y hace zoom en vez de dejar pasar el scroll.

**Solución:**
- El scroll normal de la página **ignora** el mapa (no se captura `wheel` por defecto)
- Para hacer zoom en el mapa: **Ctrl + scroll** (desktop) o **pinch** (móvil/tablet)
- Al intentar scroll sin Ctrl sobre el mapa, mostrar mensaje transitorio: "Usa Ctrl + scroll para hacer zoom"
- El zoom también funciona con los botones **+** y **−**

**Implementación:** En el handler de D3 zoom, filtrar eventos `wheel` que no tengan `ctrlKey === true`. Mostrar overlay temporal con el mensaje cuando se detecte wheel sin Ctrl.

### 4. Pantalla completa — Fullscreen API

Al hacer clic en el botón de expandir (⛶):
- Usar `element.requestFullscreen()` del browser — toma toda la pantalla real del navegador
- Layout en fullscreen: **sidebar fijo a la izquierda** (mismo que embebido) + mapa ocupa todo el espacio restante
- Salir con: botón ✕ en la esquina superior derecha del sidebar, o tecla Escape
- Controles de zoom: botones +/− en esquina inferior derecha del mapa
- Hint "Ctrl + scroll para zoom" en esquina inferior izquierda

**Fallback:** Si la Fullscreen API no está disponible, usar modal con `position: fixed; inset: 0; z-index: 9999`.

### 5. Eliminar elipses de confianza

Las elipses/círculos dashed que representan el nivel de confianza de la posición evidenciada se eliminan completamente:
- Remover el render de ellipses en `EntityPoints.tsx`
- Remover el cálculo `confidenceToRadius`
- El nivel de confianza sigue visible en el tooltip y en la página de detalle de cada figura

### 6. Cargos en español — Centralización

**Problema:** Las traducciones de `EntityType` están duplicadas en 5+ archivos, y en algunos lugares (tooltip del compass, index.astro) se usa `entity.type.replace('_', ' ')` que produce texto en inglés.

**Solución:** Crear un mapa centralizado de traducciones:

```typescript
// packages/schema/src/i18n.ts (o apps/web/src/lib/i18n.ts)
export const entityTypeLabels: Record<EntityType, { singular: string; plural: string }> = {
  president:                { singular: 'Presidente',              plural: 'Presidentes' },
  vice_president:           { singular: 'Vicepresidente',          plural: 'Vicepresidentes' },
  presidential_candidate:   { singular: 'Candidato presidencial',  plural: 'Candidatos presidenciales' },
  vp_candidate:             { singular: 'Candidato a vicepresidente', plural: 'Candidatos a vicepresidente' },
  senator:                  { singular: 'Senador',                 plural: 'Senadores' },
  representative:           { singular: 'Representante a la Cámara', plural: 'Representantes' },
  governor:                 { singular: 'Gobernador',              plural: 'Gobernadores' },
  mayor:                    { singular: 'Alcalde',                 plural: 'Alcaldes' },
};
```

Actualizar todos los consumidores para usar este mapa.

### 7. Estilo periódico refinado

- Sidebar: bordes finos (`1px solid var(--rule)`), fondo `var(--paper-raised)`, tipografía serif en labels
- Sección headers: monospace, uppercase, letter-spacing, color `var(--ink-mute)` — estilo "kicker" de periódico
- Checkboxes y dropdowns: estilizados con bordes sutiles, fondo crema, tipografía Georgia
- Botones de zoom: fondo paper, borde rule, hover sutil
- Transiciones suaves al activar/desactivar capas (fade in/out ~200ms)

## Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `components/compass/Compass.tsx` | Remover zoom por wheel sin Ctrl, agregar overlay de hint, remover tooltip con tipo en inglés |
| `components/compass/CompassWithModal.tsx` | Reemplazar modal por Fullscreen API, integrar sidebar siempre visible |
| `components/compass/CompassToolbar.tsx` | Refactorizar como sidebar con secciones (Capas/Filtros/Guía) |
| `components/compass/layers/EntityPoints.tsx` | Remover elipses de confianza, condicionar render a capas activas |
| `components/compass/layers/Axes.tsx` | Sin cambios significativos |
| `components/compass/layers/IdeologyGrid.tsx` | Sin cambios significativos |
| `apps/web/src/lib/i18n.ts` | **Nuevo:** mapa centralizado de traducciones EntityType |
| `apps/web/src/pages/index.astro` | Usar i18n para cargos, ajustar integración del compass |
| `apps/web/src/pages/figuras/index.astro` | Usar i18n centralizado |
| `apps/web/src/pages/figuras/[slug].astro` | Usar i18n centralizado |
| `apps/web/src/styles/globals.css` | Estilos del sidebar, fullscreen overlay, hint de scroll |

## Fuera de alcance

- Cambios en los datos JSON (ideologías, entidades)
- Cambios en el API worker
- Cambios en la estructura de páginas (rutas)
- Responsive avanzado para tablets (se hará después si es necesario)
