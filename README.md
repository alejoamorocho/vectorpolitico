# 🧭 Brújula Política

> **¿Dónde dice que está? ¿Dónde está realmente?**
> Mapa político interactivo de Colombia — propuestas vs realidad, evidenciado y con fuentes.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare_Pages-orange)](https://pages.cloudflare.com/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)](CONTRIBUTING.md)
[![Colombia](https://img.shields.io/badge/País-Colombia-yellow)](packages/data/colombia/)

---

## ¿Qué es esto?

**Brújula Política** es una plataforma educativa de código abierto que ubica a figuras y partidos políticos colombianos en el espectro ideológico — no según lo que dicen, sino según lo que hacen.

Cada figura tiene **dos puntos** en el mapa:

- 🔵 **Autopercibido** — lo que declara en sus propios canales (página oficial, partido, Wikipedia, programa de gobierno)
- 🔴 **Evidenciado** — análisis propio del proyecto sobre acciones concretas (votaciones en CongresoVisible, decretos, ejecución presupuestal, registros oficiales)

La flecha entre los dos puntos es su **índice de coherencia**.

### El problema que resuelve

En Colombia existe una percepción generalizada de que la política se reduce a dos o tres opciones (uribismo, petrismo, y "algo de centro"). Esta plataforma busca:

1. **Mostrar la riqueza del espectro ideológico real** — hay más de 150 corrientes políticas documentadas en el compass
2. **Separar el discurso de los hechos** — con fuentes verificables y archivadas en Wayback Machine
3. **Democratizar el análisis político** — una herramienta para cualquier ciudadano, no solo académicos
4. **Ser replicable** — cualquier país puede usar este framework con sus propios datos

---

## Stack técnico

```
Frontend:   Astro 5 + React (islas) + TypeScript
Estilos:    Tailwind CSS + Framer Motion
Compass:    D3.js (SVG interactivo)
Hosting:    Cloudflare Pages
API:        Cloudflare Workers + Hono.js
Base datos: Cloudflare D1 (SQLite)
Assets:     Cloudflare R2
Cache:      Cloudflare KV
ETL:        Python 3.11+ (Pydantic + Anthropic SDK)
IA:         Claude API (clasificación ideológica asistida)
Noticias:   GDELT 2.0
Monorepo:   pnpm workspaces
```

---

## Estructura del repositorio

```
vectorpolitico/
├── apps/
│   ├── web/                   # Frontend Astro + React (SSG → Cloudflare Pages)
│   └── api/                   # API Cloudflare Worker + Hono
├── packages/
│   ├── schema/                # Tipos TS + schemas Zod (fuente de verdad)
│   ├── data/                  # JSON con figuras, partidos, ideologías
│   │   ├── ideologies.source.yaml
│   │   ├── ideologies.json
│   │   └── colombia/
│   └── etl/                   # Scripts Python (clasificación, ingesta, validación)
├── docs/
│   ├── methodology/           # Fórmulas del compass, estándares, fuentes
│   ├── contributing/          # Cómo agregar políticos, cómo agregar países
│   └── decisions/             # ADRs (Architectural Decision Records)
├── .github/                   # CI/CD, issue templates, PR template
├── LICENSE                    # Apache 2.0
└── README.md
```

---

## Desarrollo local

### Requisitos

- **Node.js** 20.11.0+ (ver `.nvmrc`)
- **pnpm** 9+
- **Python** 3.11+ (para el ETL)
- **Wrangler CLI** (para trabajar con Cloudflare local):
  ```bash
  pnpm install -g wrangler
  ```

### Setup

```bash
# 1. Clonar y entrar
git clone https://github.com/alejoamorocho/vectorpolitico.git
cd vectorpolitico

# 2. Instalar dependencias JS/TS
pnpm install

# 3. Instalar dependencias Python
cd packages/etl
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
cd ../..

# 4. Copiar archivos de ejemplo de secrets
cp packages/etl/.env.example packages/etl/.env
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Editar ambos con valores reales (NUNCA commitear)

# 5. Instalar pre-commit hooks (OBLIGATORIO — protege contra filtración de secrets)
pip install pre-commit
pre-commit install

# 6. Generar compass de ideologías
pnpm generate:ideologies

# 7. Arrancar dev server
pnpm dev
```

Abre `http://localhost:4321/` en el navegador.

---

## 🔐 Gestión de secrets — LEER ANTES DE CONTRIBUIR

Este proyecto es **open source**. Un leak accidental de secrets (especialmente `ANTHROPIC_API_KEY` o `CLOUDFLARE_API_TOKEN`) es crítica máxima.

### Capas de defensa

1. **`.gitignore` estricto** — bloquea `.env`, `.env.*`, `.dev.vars`, `.wrangler/`, `*.pem`, `*.key`, `secrets/`
2. **Pre-commit hooks con gitleaks** — escanean cada commit antes de aceptarlo
3. **CI security-scan** — gitleaks corre también en GitHub Actions como red de respaldo
4. **Wrangler secrets** para producción — `wrangler secret put` cifra y almacena en Cloudflare
5. **GitHub Actions Environments** — `production` requiere review manual; secrets nunca expuestos a forks
6. **Rotación documentada** — ver abajo

### Inventario de secrets

| Secret | Uso | Dónde guardar |
|---|---|---|
| `ANTHROPIC_API_KEY` | ETL (clasificador Claude) | `.env` local + `wrangler secret put` + GH Actions secret |
| `CLOUDFLARE_API_TOKEN` | CI (deploys) | GH Actions secret (scope: Workers:Edit, D1:Edit, R2:Edit, Pages:Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | CI | GH Actions **variable** (no secret) |
| `WAYBACK_API_KEY` | ETL (archivar URLs automáticamente, opcional) | `.env` local + GH Actions secret |

**GDELT** no requiere API key. **CongresoVisible** no requiere auth.

### Qué hacer si filtras un secret por accidente

1. **Rotar inmediatamente** (no intentar borrar el commit):
   - Anthropic: https://console.anthropic.com/settings/keys — revocar la key expuesta, crear nueva
   - Cloudflare: https://dash.cloudflare.com/profile/api-tokens — revocar token, crear nuevo
2. **Actualizar** `.env` local y `wrangler secret put` con el nuevo valor
3. **Notificar** al mantenedor abriendo un issue con etiqueta `security` (sin incluir el secret)
4. **Limpiar historial** solo si el mantenedor lo aprueba (requiere force-push coordinado)

---

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md). El resumen:

- **Agregar una figura política** → [Guía paso a paso](docs/contributing/add-politician.md)
- **Reportar una incoherencia** → [Abre un issue](../../issues/new?template=incoherence-report.md)
- **Expandir a otro país** → [Guía de países](docs/contributing/add-country.md)
- **Bugs o mejoras técnicas** → PR directo con descripción clara

### Estándar de datos

Toda incoherencia publicada requiere obligatoriamente:
1. Cita textual de la promesa + fuente + fecha
2. Hecho contrario verificable + fuente primaria + fecha
3. Fuente primaria (votación oficial, decreto, presupuesto — no Twitter)
4. URL archivada en Wayback Machine
5. Revisión de al menos un colaborador adicional

Sin estos 5 elementos, el PR no se fusiona. Ver [estándar completo](docs/methodology/incoherence-standard.md).

---

## Metodología

La metodología completa está en [`docs/methodology/`](docs/methodology/). Es pública, versionada y auditable.

El principio rector: **toda posición en el compass debe poder justificarse con hechos verificables y fuentes primarias.** No publicamos opinión disfrazada de dato.

- [`compass-scoring.md`](docs/methodology/compass-scoring.md) — Fórmulas, pesos, criterios exactos para calcular (x,y)
- [`ideology-classification.md`](docs/methodology/ideology-classification.md) — Cómo se asigna la etiqueta ideológica con fuentes (v2)
- [`incoherence-standard.md`](docs/methodology/incoherence-standard.md) — Estándar mínimo para publicar incoherencias
- [`data-sources.md`](docs/methodology/data-sources.md) — Fuentes primarias por tipo de figura y metadata de ideologías/partidos

---

## Licencia

Apache 2.0 — ver [LICENSE](LICENSE).

Puedes usar, modificar y distribuir libremente, incluso para fines comerciales, siempre que mantengas la atribución y el aviso de licencia.

---

## Créditos

Iniciativa de [Alejo Amorocho](https://github.com/alejoamorocho), Cali, Colombia.

Inspirado en [Political Compass](https://politicalcompass.org/), [CongresoVisible](https://congresovisible.uniandes.edu.co/) y [Votainteligente](https://votainteligente.cl/).

---

*¿Preguntas? Abre un [issue](../../issues) o escríbenos.*
