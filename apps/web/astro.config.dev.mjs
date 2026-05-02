// Configuración alternativa para desarrollo local — usa el adapter de Node
// en lugar de Cloudflare. Útil cuando Windows Defender Application Control (WDAC)
// bloquea el binario `workerd.exe` que requiere @astrojs/cloudflare con miniflare.
//
// Uso:
//   pnpm --filter @brujula/web dev:node
//
// Diferencias con astro.config.mjs (producción):
//   - Sin adapter Cloudflare → no requiere workerd ni miniflare
//   - Sin platformProxy / KV / D1 / R2 — features de runtime de Cloudflare no funcionan
//     (pero el ~95% del sitio es SSG, así que rinde casi todo bien)
//   - Las rutas que usen Astro.locals.runtime.env devolverán undefined
//
// El build de producción sigue usando astro.config.mjs (Cloudflare Pages).

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://brujula-politica-web.pages.dev',
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
