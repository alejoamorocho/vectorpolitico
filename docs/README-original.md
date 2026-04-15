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

- 🔵 **Autopercibido** — lo que declara, promete y dice ser
- 🔴 **Evidenciado** — lo que revelan sus votaciones, decretos y acciones documentadas

La flecha entre los dos puntos es su **índice de coherencia**.

### El problema que resuelve

En Colombia existe una percepción generalizada de que la política se reduce a dos o tres opciones (uribismo, petrismo, y "algo de centro"). Esta plataforma busca:

1. **Mostrar la riqueza del espectro ideológico real** — hay más de 150 corrientes políticas documentadas
2. **Separar el discurso de los hechos** — con fuentes verificables y archivadas
3. **Democratizar el análisis político** — una herramienta para cualquier ciudadano, no solo académicos
4. **Ser replicable** — cualquier país puede usar este framework con sus propios datos

---

## Demo

🌐 **[brujulapolitica.co](https://brujulapolitica.co)** *(próximamente)*

---

## Características

### V1 — Colombia

- [x] Compass político interactivo con ~150 corrientes ideológicas
- [x] Doble posicionamiento por figura (autopercibido vs evidenciado)
- [x] Filtros por tipo de cargo (presidente, candidato, senador, representante, gobernador, alcalde)
- [x] Filtros por período
- [x] Perfil individual con bio, propuestas y acciones documentadas
- [x] Tabla de incoherencias con fuentes primarias
- [x] Posición relativa dentro de su partido
- [x] Posición relativa en su período histórico
- [x] Noticias relevantes por figura
- [x] Metodología pública y auditable
- [x] SEO optimizado — cada figura tiene URL propia indexada

### Roadmap

- [ ] Expansión a otros países de LATAM (framework listo, datos por comunidad)
- [ ] Trayectoria temporal del compass por figura
- [ ] Red de financiación de campaña (CNE)
- [ ] Cohesión interna por partido
- [ ] Comparación entre figuras
- [ ] App móvil

---

## Stack técnico

```
Frontend:   Astro 5 + React + TypeScript
Estilos:    Tailwind CSS + Framer Motion
Compass:    D3.js (SVG interactivo)
Hosting:    Cloudflare Pages
API:        Cloudflare Workers + Hono.js
Base datos: Cloudflare D1 (SQLite)
Assets:     Cloudflare R2
ETL:        Python 3.11+
IA:         Claude API (clasificación ideológica)
Noticias:   GDELT
```

---

## Estructura del repositorio

```
brujula-politica/
├── apps/
│   ├── web/                    # Frontend Astro + React
│   │   ├── src/
│   │   │   ├── pages/          # Rutas SSG (figuras, partidos, períodos)
│   │   │   ├── components/     # Componentes React (compass, filtros, perfiles)
│   │   │   └── layouts/
│   │   └── astro.config.mjs
│   └── api/                    # Cloudflare Worker (Hono.js)
│       └── src/
│           └── index.ts
├── packages/
│   ├── data/                   # ← FUENTE DE VERDAD
│   │   ├── ideologies.json     # Las ~150 corrientes del compass
│   │   └── colombia/
│   │       ├── parties.json
│   │       ├── presidents.json
│   │       ├── candidates.json
│   │       ├── senators.json
│   │       ├── representatives.json
│   │       ├── governors.json
│   │       └── mayors.json
│   ├── schema/                 # Tipos TypeScript compartidos
│   │   └── src/types.ts
│   └── etl/                    # Scripts Python de ingesta y clasificación
│       ├── classify_entity.py  # Clasificación con Claude API
│       ├── fetch_news.py       # Noticias vía GDELT
│       └── validate.py         # Validación de schemas antes de PR
├── docs/
│   ├── methodology/
│   │   ├── compass-scoring.md  # Fórmulas, pesos, criterios exactos
│   │   ├── incoherence-standard.md # Estándar mínimo para publicar
│   │   ├── data-sources.md     # Fuentes por tipo de figura
│   │   └── confidence-levels.md
│   ├── contributing/
│   │   ├── CONTRIBUTING.md
│   │   ├── ADD_POLITICIAN.md   # Guía paso a paso para agregar figuras
│   │   └── ADD_COUNTRY.md      # Cómo replicar para otro país
│   └── decisions/              # ADRs — por qué se tomó cada decisión técnica
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml          # CI/CD a Cloudflare Pages
│   │   └── validate-data.yml   # Valida JSON schemas en cada PR
│   ├── ISSUE_TEMPLATE/
│   │   ├── add-politician.md
│   │   ├── incoherence-report.md
│   │   └── bug-report.md
│   └── PULL_REQUEST_TEMPLATE.md
├── LICENSE                     # Apache 2.0
├── README.md
└── package.json                # pnpm workspaces
```

---

## Cómo contribuir

Lee primero [CONTRIBUTING.md](CONTRIBUTING.md). El resumen:

- **Agregar una figura política** → [Guía paso a paso](docs/contributing/ADD_POLITICIAN.md)
- **Reportar una incoherencia** → [Abre un issue](https://github.com/tu-org/brujula-politica/issues/new?template=incoherence-report.md)
- **Expandir a otro país** → [Guía de países](docs/contributing/ADD_COUNTRY.md)
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

## Fuentes de datos — Colombia

| Tipo | Fuente | Cobertura |
|---|---|---|
| Votaciones Congreso | CongresoVisible (Uniandes) | 2002 — presente |
| Resultados electorales | Registraduría Nacional | 1990 — presente |
| Planes de gobierno | CNE | 2002 — presente |
| Ejecución presupuestal | Contraloría General | 2010 — presente |
| Declaraciones de bienes | SIGEP II | 2014 — presente |
| Datos abiertos | datos.gov.co | Varios |
| Noticias | GDELT | 2013 — presente |

---

## Metodología

La metodología completa está en [`/docs/methodology/`](docs/methodology/). Es pública, versionada y auditable.

El principio rector: **toda posición en el compass debe poder justificarse con hechos verificables y fuentes primarias.** No publicamos opinión disfrazada de dato.

---

## Licencia

Apache 2.0 — ver [LICENSE](LICENSE).

Puedes usar, modificar y distribuir libremente, incluso para fines comerciales, siempre que mantengas la atribución y el aviso de licencia.

---

## Créditos

Iniciativa de [Alejo Amorocho](https://github.com/alejoamorocho), Cali, Colombia.

Inspirado en [Political Compass](https://politicalcompass.org/), [CongresoVisible](https://congresovisible.uniandes.edu.co/) y [Votainteligente](https://votainteligente.cl/).

---

*¿Preguntas? Abre un [issue](https://github.com/tu-org/brujula-politica/issues) o escríbenos.*
