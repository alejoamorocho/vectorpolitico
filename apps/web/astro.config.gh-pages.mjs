// Configuración de build para GitHub Pages.
//
// Diferencias con astro.config.mjs (Cloudflare Pages):
//   - Sin adapter (SSG puro). No requiere workerd ni miniflare.
//   - `site` apunta al dominio de GitHub Pages.
//   - `base` configura el path en el que se sirve (/vectorpolitico/).
//     Esto hace que todos los links internos se generen como
//     /vectorpolitico/metodologia/..., compatibles con GH Pages.
//
// Uso:
//   pnpm --filter @brujula/web build:gh-pages
//
// El build de Cloudflare sigue funcionando con astro.config.mjs cuando
// se configuren los secrets de Cloudflare.

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://alejoamorocho.github.io',
  base: '/vectorpolitico',
  output: 'static',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  // trailingSlash 'always' garantiza compatibilidad con rutas /foo/ en GH Pages
  trailingSlash: 'always',
});
