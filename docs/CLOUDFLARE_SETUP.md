# Setup de Cloudflare — paso a paso

Esta guía configura todos los recursos de Cloudflare necesarios para deployar Brújula Política: D1, R2, KV y Pages. El usuario ejecuta los comandos; los IDs resultantes se pegan en `apps/api/wrangler.toml`.

## Prerrequisitos

- Cuenta gratuita en [Cloudflare](https://dash.cloudflare.com/sign-up) (el plan free sobra para empezar)
- Node.js 20+ y pnpm 9+ instalados
- Wrangler CLI — se instala automáticamente con `pnpm install` en la raíz del repo

## Paso 1 — Login en Cloudflare

```bash
cd apps/api
pnpm dlx wrangler login
# Abre el navegador, acepta la autorización
pnpm dlx wrangler whoami
# Anota tu Account ID
```

> **IMPORTANTE:** Para CI (GitHub Actions) **no** se usa `wrangler login`. Se usa un API token creado desde [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) con la plantilla "Edit Cloudflare Workers" + permisos D1/R2/Pages. Guardar como `CLOUDFLARE_API_TOKEN` en GitHub Actions secrets.

## Paso 2 — Crear bases D1 (producción y staging)

```bash
# Producción
pnpm dlx wrangler d1 create brujula-politica
# → anota el database_id devuelto

# Staging
pnpm dlx wrangler d1 create brujula-politica-staging
# → anota el database_id devuelto
```

Copia ambos IDs en `wrangler.toml` reemplazando `PEGAR_D1_DATABASE_ID_PROD` y `PEGAR_D1_DATABASE_ID_STAGING`.

## Paso 3 — Aplicar migraciones

```bash
# Local (para dev)
pnpm dlx wrangler d1 execute brujula-politica --local --file=migrations/0001_initial.sql

# Staging remoto
pnpm dlx wrangler d1 execute brujula-politica-staging --remote --file=migrations/0001_initial.sql

# Producción remoto (solo cuando esté listo)
pnpm dlx wrangler d1 execute brujula-politica --remote --file=migrations/0001_initial.sql
```

Repetir para las migraciones `0002_fts.sql`, `0003_news.sql`, `0004_indexes.sql` cuando existan.

## Paso 4 — Crear buckets R2

```bash
pnpm dlx wrangler r2 bucket create brujula-politica-assets
pnpm dlx wrangler r2 bucket create brujula-politica-assets-staging
```

R2 no devuelve ID — se referencia por nombre. El `wrangler.toml` ya tiene los nombres correctos.

## Paso 5 — Crear KV namespaces

```bash
# CACHE
pnpm dlx wrangler kv namespace create CACHE
pnpm dlx wrangler kv namespace create CACHE --preview
pnpm dlx wrangler kv namespace create CACHE --env staging

# RATELIMIT
pnpm dlx wrangler kv namespace create RATELIMIT
pnpm dlx wrangler kv namespace create RATELIMIT --preview
pnpm dlx wrangler kv namespace create RATELIMIT --env staging
```

Cada comando devuelve un `id`. Pegarlos en `wrangler.toml` reemplazando los `PEGAR_KV_ID_*`.

## Paso 6 — Configurar secrets del Worker

```bash
# Producción
pnpm dlx wrangler secret put ANTHROPIC_API_KEY
# (pega la key sk-ant-... cuando te la pida)

# Staging
pnpm dlx wrangler secret put ANTHROPIC_API_KEY --env staging
```

**Los secrets nunca aparecen en wrangler.toml** — Cloudflare los cifra y los inyecta como variables de entorno del Worker en runtime.

Para listarlos (no muestra los valores):
```bash
pnpm dlx wrangler secret list
pnpm dlx wrangler secret list --env staging
```

## Paso 7 — Deploy del Worker (API)

```bash
cd apps/api

# Instalar deps si aún no lo has hecho
pnpm install --filter @brujula/api

# Deploy a staging primero
pnpm dlx wrangler deploy --env staging

# Probar
curl https://brujula-politica-api-staging.<tu-subdominio>.workers.dev/health

# Deploy a producción
pnpm dlx wrangler deploy
```

## Paso 8 — Crear el proyecto Pages (web)

```bash
pnpm dlx wrangler pages project create brujula-politica-web --production-branch=main
```

## Paso 9 — Build y deploy del frontend

```bash
cd ../web
pnpm install --filter @brujula/web
pnpm build

pnpm dlx wrangler pages deploy dist --project-name=brujula-politica-web --branch=main
```

Obtendrás una URL tipo `https://brujula-politica-web.pages.dev`.

## Paso 10 — Conectar GitHub (opcional, para CI/CD automatizado)

Desde el dashboard de Cloudflare Pages, ir a tu proyecto → Settings → Builds & deployments → Git → Connect. Seleccionar el repo. Cloudflare hará deploys automáticos en cada push a `main`.

**Alternativa recomendada:** usar los workflows de GitHub Actions en `.github/workflows/` que hacen lo mismo con más control y los mismos secrets manejados centralizadamente.

---

## Troubleshooting

### "No account_id found"
Asegúrate de haber corrido `wrangler login` o de tener la variable de entorno `CLOUDFLARE_ACCOUNT_ID` configurada.

### "Database not found" al ejecutar una migración
Verifica que el `database_id` en `wrangler.toml` coincida exactamente con el devuelto por `wrangler d1 create`.

### El Worker falla con "Binding not found: DB"
Faltan los bindings en `wrangler.toml` o el `database_id` es incorrecto. Verifica con `wrangler d1 list`.

### "KV namespace not found"
Verifica con `wrangler kv namespace list` que los IDs en `wrangler.toml` existan.

---

## Rotación de secrets

Si por cualquier razón necesitas rotar un secret (sospecha de leak, fin de contrato, etc.):

```bash
# 1. Crear nuevo secret en Anthropic/Cloudflare/etc.
# 2. Actualizar en el Worker
pnpm dlx wrangler secret put ANTHROPIC_API_KEY
# 3. Actualizar en GitHub Actions (Settings → Secrets and variables → Actions)
# 4. Actualizar tu .env local y .dev.vars local
# 5. Revocar el secret antiguo en el proveedor
```
