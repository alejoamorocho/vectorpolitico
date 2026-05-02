# Desarrollo local

## Servidor de desarrollo

Hay tres formas de ver el sitio en local. Elige la que aplique.

### 1. `pnpm dev` — adapter Cloudflare (default)

```bash
pnpm --filter @brujula/web dev
```

Usa `@astrojs/cloudflare` con `miniflare` y `workerd`. Es el adapter de producción y el más fiel al despliegue final. Requiere que `workerd.exe` pueda ejecutarse en tu máquina.

**Cuándo usarlo:** trabajo cotidiano en Linux, macOS, o Windows sin políticas restrictivas.

### 2. `pnpm dev:node` — adapter Node (fallback WDAC) ⭐

```bash
pnpm --filter @brujula/web dev:node
```

Usa `@astrojs/node` (standalone). Sin `workerd`, sin `miniflare`. Mantiene HMR completo de Astro.

**Cuándo usarlo:** Windows con WDAC (Windows Defender Application Control) o AppLocker bloqueando `workerd.exe`. El error típico es:

```
[ERROR] [@astrojs/cloudflare] An unhandled error occurred while running the
"astro:server:setup" hook: spawn UNKNOWN
```

**Limitaciones del adapter Node:**
- `Astro.locals.runtime.env` es `undefined` (las KV/D1/R2 bindings no funcionan en dev)
- Las rutas que dependan del runtime de Cloudflare deben tener fallback
- El build de producción sigue usando Cloudflare — esto es solo para desarrollo

### 3. `pnpm serve:dist` — servidor estático puro

```bash
pnpm --filter @brujula/web build
pnpm --filter @brujula/web serve:dist
```

Server HTTP de Node mínimo (`apps/web/scripts/serve-dist.mjs`) que sirve `dist/` sin ningún adapter. No tiene HMR; ves exactamente el build de producción estático. Útil cuando quieres probar el output final sin ningún wrapper.

## Validación de datos

```bash
# Ver coherencia interna del dataset
python scripts/validate_dataset.py
python scripts/validate_dataset.py --threshold 2.0  # más estricto

# Aplicar fix automático cuando hay drift por correcciones manuales
python scripts/fix_validation_warnings.py --dry-run
python scripts/fix_validation_warnings.py

# Aplicar análisis semántico (scores por agente IA)
python scripts/apply_semantic_scores.py
```

Detalle metodológico en `docs/methodology/data-validation.md`.

## Generación del grid

El grid de ideologías se genera del YAML curado:

```bash
cd packages/etl
python -m src.generate_ideologies --country=co
```

El YAML (`packages/data/ideologies.source.yaml`) es la fuente de verdad. **Nunca editar `ideologies.json` a mano** — es regenerado.

## Build de producción

```bash
pnpm --filter @brujula/web build
```

Corre `astro build && pagefind --site dist`. El output `dist/` está listo para deploy a Cloudflare Pages.

## Tests

```bash
pnpm --filter @brujula/web test
```

Vitest está configurado pero no hay tests unitarios todavía. La validación de datos (`scripts/validate_dataset.py`) actúa como suite de tests de integridad para el dataset.

## Solución de problemas

### `spawn UNKNOWN` al correr `pnpm dev` en Windows

WDAC bloqueó `workerd.exe`. Soluciones:

1. **Recomendado**: usa `pnpm dev:node` (ver arriba).
2. **Alternativa**: pídele a IT que añada al allowlist:
   ```
   C:\Proyectos\VectorPolitico\node_modules\@astrojs\cloudflare\node_modules\@cloudflare\workerd-windows-64\bin\workerd.exe
   ```

### Build pasa pero algo no carga en runtime

Verifica que la ruta no use `Astro.locals.runtime.env` con dev:node (no está disponible). Para esas features prueba el dev de Cloudflare cuando tengas workerd activo.

### `python` no encuentra módulos del ETL

```bash
cd packages/etl
pip install -r requirements.txt
```

Las dependencias incluyen `anthropic`, `pyyaml`, `pydantic`. El validador en `scripts/validate_dataset.py` y el aplicador `scripts/apply_semantic_scores.py` usan **solo stdlib** y no requieren instalación.
