# Security — gestión de secrets en Brújula Política

Este proyecto es **open source**. Un leak accidental de secrets es un incidente de prioridad máxima. Este documento describe la estrategia de defensa en profundidad que seguimos y qué hacer si algo sale mal.

## Filosofía

> **Defensa en profundidad:** múltiples capas independientes. Si una falla, otra atrapa el problema.

## Las 8 capas

### 1. `.gitignore` estricto

La primera línea de defensa. Bloquea archivos que contienen secrets antes de que lleguen a `git add`.

```gitignore
.env
.env.*
!.env.example
.dev.vars
!.dev.vars.example
.wrangler/
*.pem
*.key
secrets/
```

Ver `.gitignore` en la raíz para la lista completa.

### 2. `.dev.vars.example` versionado, `.dev.vars` gitignored

Los Workers de Cloudflare en dev local consumen secrets de `apps/api/.dev.vars`. Commiteamos solo el `.example` con placeholders:

```
ANTHROPIC_API_KEY=sk-ant-REPLACE_ME
```

Cada contribuidor hace `cp .dev.vars.example .dev.vars` y rellena con valores reales, que permanecen locales.

### 3. `wrangler secret put` para producción

Los secrets de producción se inyectan al Worker vía `wrangler secret put <NAME>`. Cloudflare los cifra y los hace accesibles solo desde el runtime del Worker:

```bash
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put ANTHROPIC_API_KEY --env staging
```

No aparecen en `wrangler.toml`, no aparecen en logs de deploy, no aparecen en listados excepto por nombre (`wrangler secret list`).

### 4. GitHub Actions Environments con required reviewers

Los workflows que tocan producción (`deploy-api.yml`, `deploy-web.yml`, `sync-data.yml` con target=production) se atan a un Environment `production` con required reviewers. Los secrets de producción son del environment, no del repo, por lo que un fork no puede accederlos.

```yaml
jobs:
  deploy:
    environment: production  # ← requiere aprobación manual
```

### 5. Python `.env` con `python-dotenv`

El ETL lee sus secrets de `packages/etl/.env`. `classify_entity.py` y `fetch_news.py` llaman a `load_dotenv()` al arrancar y validan que `ANTHROPIC_API_KEY` exista, abortando con mensaje claro si no.

### 6. Pre-commit hooks con gitleaks

`.pre-commit-config.yaml` instala gitleaks como hook pre-commit. Escanea cada commit antes de aceptarlo, con reglas custom para `sk-ant-*` y tokens de Cloudflare.

Instalación (una vez por clon):

```bash
pip install pre-commit
pre-commit install
```

### 7. CI security-scan

`.github/workflows/security-scan.yml` corre gitleaks también en CI como red de respaldo. Además escanea dependencias con `pnpm audit` y `pip-audit` semanalmente.

### 8. Rotación documentada

Incluso con las 7 capas anteriores, un leak puede ocurrir. Lo que importa es **qué tan rápido reaccionas**. Ver "Qué hacer si filtras un secret" abajo.

## Inventario completo de secrets

| Secret | Dónde se usa | Tipo | Dónde vive |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | ETL Python + (futuro) Worker | `sk-ant-...` | `.env` local · `wrangler secret put` · GH Actions secret del environment |
| `CLOUDFLARE_API_TOKEN` | CI | API token | GH Actions secret (no variable) |
| `CLOUDFLARE_ACCOUNT_ID` | CI | ID público | GH Actions **variable** (no secret) |
| `WAYBACK_API_KEY` | ETL (opcional) | bearer | `.env` local · GH Actions secret |
| `SENTRY_DSN` (futuro) | Worker | DSN | `wrangler secret put` |

**GDELT** es API pública sin auth.
**CongresoVisible** es web scraping sin auth.

## Anti-patterns explícitamente prohibidos

- ❌ Poner secrets en `wrangler.toml [vars]`
- ❌ Usar `wrangler login` en GitHub Actions (usar API token con scope mínimo)
- ❌ Commitear `.wrangler/state/` (contiene D1 local con datos)
- ❌ Hardcodear secrets en código fuente "temporalmente"
- ❌ Pegar secrets en comentarios de PRs o issues
- ❌ Compartir secrets por Slack/email sin cifrar
- ❌ Reutilizar el mismo token para varios proyectos

## Qué hacer si filtras un secret

**Actúa rápido, en este orden:**

### Paso 1 — Rotar inmediatamente

No intentes borrar el commit primero. El secret ya salió al mundo — desactívalo antes que cualquier otra cosa.

- **Anthropic:** [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) — revocar la key expuesta, crear una nueva
- **Cloudflare:** [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) — revocar token, crear nuevo
- **Wayback Machine:** [archive.org/account/s3.php](https://archive.org/account/s3.php)

### Paso 2 — Actualizar en todos los lugares

- `.env` local y `.dev.vars` local (cada desarrollador)
- `wrangler secret put ANTHROPIC_API_KEY` (producción y staging)
- GitHub Actions Secrets del environment
- Cualquier otro lugar donde se usara

### Paso 3 — Notificar al mantenedor

Abre un issue privado con etiqueta `security` (sin incluir el secret rotado). El mantenedor evaluará si:
- El secret se usó maliciosamente
- Hay que limpiar historial de git (requiere force-push coordinado con todos los colaboradores)
- Hay que avisar a otros servicios integrados

### Paso 4 — Post-mortem

Si el incidente fue significativo, documentar qué falló (qué capa de defensa no atrapó el leak) y cómo prevenir recurrencias.

## Tokens de Cloudflare con scope mínimo

Para el token de GitHub Actions, usar la plantilla "Edit Cloudflare Workers" y agregar solo los permisos adicionales estrictamente necesarios:

- ✅ `Account` → `Workers Scripts: Edit`
- ✅ `Account` → `Cloudflare Pages: Edit`
- ✅ `Account` → `Account Settings: Read`
- ✅ `Account` → `D1: Edit`
- ✅ `Account` → `Workers R2 Storage: Edit`
- ✅ `Account` → `Workers KV Storage: Edit`
- ❌ NO incluir permisos de Zone/DNS si no es necesario
- ❌ NO usar tokens globales de cuenta

## Verificación manual periódica

Trimestralmente, un mantenedor debe ejecutar:

```bash
# 1. Scan histórico del repo
gitleaks detect --source . --log-opts="--all"

# 2. Verificar secrets activos en Cloudflare
wrangler secret list
wrangler secret list --env staging

# 3. Verificar que pre-commit está instalado en las máquinas de los contribuidores activos
# (revisar últimos PRs por si algún commit no fue verificado)
```

---

**¿Dudas o sospecha de incidente?** Abre un issue con etiqueta `security` sin incluir valores sensibles. El mantenedor responderá en máximo 24 horas.
