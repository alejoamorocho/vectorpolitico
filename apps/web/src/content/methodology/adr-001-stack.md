---
title: ADR-001 — Stack técnico (Astro + Cloudflare)
description: Decisión arquitectónica de fundación del proyecto. Por qué Astro + React + Cloudflare Pages + D1 + R2 + Workers + Hono fue elegido sobre alternativas como Next.js+Vercel o Vite+Firebase.
order: 80
section: adr
version: 1.0.0
lastUpdated: 2026-04-10
authors:
  - ssi-co
---

> **Estado:** Aceptado · **Fecha de decisión:** 2026-04-10

## Contexto

Se necesita definir el stack técnico para una plataforma educativa de mapa político interactivo. Los requisitos principales son:

- **SEO crítico**: cada figura política debe ser una URL indexable por Google.
- **Visualización interactiva compleja** (D3.js para el compass).
- **Serverless**: sin servidor propio que mantener.
- **Costo mínimo** para un proyecto open source.
- **Facilidad de contribución** para la comunidad.

## Decisión

| Capa | Tecnología |
|---|---|
| Frontend | Astro 5 + React + TypeScript |
| Hosting | Cloudflare Pages |
| Base de datos | Cloudflare D1 (SQLite en el edge) |
| Assets | Cloudflare R2 |
| API | Cloudflare Workers + Hono.js |
| Cache | Cloudflare KV |
| ETL | Python 3.11+ (Pydantic + Anthropic SDK) |

## Justificación

### Por qué Astro y no Vite + React puro

El proyecto tiene dos tipos de contenido muy distintos:

1. **Contenido estático con SEO crítico:** páginas de perfil de figuras políticas (`/figuras/gustavo-petro`), páginas de partidos, períodos, metodología. Estas páginas deben ser HTML pre-renderizado para que Google las indexe completamente. Con Vite + React puro (SPA), Google vería HTML vacío.

2. **Componente interactivo complejo:** el compass D3.js. Este es una "isla" de React que necesita JavaScript completo.

Astro resuelve exactamente esta dualidad: pre-renderiza en build time las páginas de contenido (SSG) y trata el compass como una isla de React hidratada en el cliente. Vite + React puro no tiene esta capacidad.

### Por qué Cloudflare y no Firebase

| Criterio | Cloudflare | Firebase |
|---|---|---|
| Hosting de assets/imágenes | R2: sin egress fee | Storage: paga por egress |
| Base de datos | D1: gratis hasta 25M reads/día | Firestore: 50K reads/día free |
| Workers/Functions | 100K req/día gratis | 2M invocaciones/mes gratis |
| Lock-in | Moderado | Alto (GCP) |

Para un proyecto con muchas imágenes (fotos de políticos) y tráfico variable, Cloudflare es significativamente más económico.

### Por qué D1 y no KV

D1 (SQLite) permite consultas relacionales (filtrar por período + cargo + partido simultáneamente). KV solo permite lookup por key. Para los filtros complejos del compass, D1 es la herramienta correcta.

### Por qué Hono

Hono es el framework más liviano y maduro para Cloudflare Workers. TypeScript nativo, excelente compatibilidad con D1, y API similar a Express/Fastify.

## Consecuencias

**Positivas**
- SEO perfecto para todas las páginas de contenido.
- Costo proyectado: $0/mes para tráfico colombiano moderado.
- Deploy automático en cada push a main.
- Sin servidor propio que mantener.

**Negativas**
- El equipo debe aprender Astro (curva baja) y Wrangler CLI.
- Las migraciones de schema en D1 son manuales (no hay Prisma para D1 aún).
- En entornos Windows con WDAC, el binario `workerd` puede ser bloqueado — mitigado con un adapter Node alternativo (`pnpm dev:node`, ver [development.md](https://github.com/alejoamorocho/vectorpolitico/blob/main/docs/development.md) en el repo).

## Alternativas consideradas

- **Next.js + Vercel**: buena opción pero más costosa en escala y con más complejidad de configuración.
- **Remix + Cloudflare**: viable pero Astro tiene mejor historia para contenido estático mixto.
- **Vite + React + Firebase**: más simple de arrancar, pero SEO deficiente y costos de Firebase Storage más altos.
