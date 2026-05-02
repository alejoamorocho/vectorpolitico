# Guía de Contribución

Gracias por querer contribuir a Brújula Política. Este documento explica cómo hacerlo correctamente.

---

## Principio fundamental

> **Publicamos hechos, no opiniones.**
> Toda posición en el compass y toda incoherencia debe poder justificarse con fuentes primarias verificables. Si no tiene fuente, no va.

---

## Tipos de contribución

### 1. Agregar o actualizar una figura política
→ Lee [ADD_POLITICIAN.md](docs/contributing/ADD_POLITICIAN.md)

### 2. Reportar una incoherencia
→ Abre un [issue con el template correspondiente](.github/ISSUE_TEMPLATE/incoherence-report.md)
→ O directamente en el JSON de la figura con PR

### 3. Mejoras técnicas (frontend, API, ETL)
→ PR directo. Lee la sección "Flujo de trabajo" más abajo.

### 4. Expandir a otro país
→ Lee [ADD_COUNTRY.md](docs/contributing/ADD_COUNTRY.md)

### 5. Correcciones de datos
→ PR con descripción clara del error y la fuente correcta

---

## Flujo de trabajo

```bash
# 1. Fork del repositorio
# 2. Crea una rama con nombre descriptivo
git checkout -b data/add-ivan-duque
git checkout -b fix/petro-compass-position
git checkout -b feat/comparison-view

# 3. Haz tus cambios

# 4. Valida los datos antes de hacer commit
pnpm validate

# 5. Commit con mensaje claro (Conventional Commits)
git commit -m "data(co): add Iván Duque — presidents"
git commit -m "fix(co): correct Petro compass X axis — source added"
git commit -m "feat(web): add politician comparison view"

# 6. Push y Pull Request
git push origin data/add-ivan-duque
```

---

## Convenciones de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

| Prefijo | Uso |
|---|---|
| `data(co):` | Datos de Colombia |
| `data(mx):` | Datos de otro país |
| `feat(web):` | Nueva funcionalidad frontend |
| `feat(api):` | Nueva funcionalidad API |
| `fix:` | Corrección de bug o dato |
| `docs:` | Documentación |
| `chore:` | Mantenimiento, dependencias |
| `refactor:` | Refactorización sin cambio de comportamiento |

---

## Estándar de calidad para datos

### Para posicionamiento en el compass

Cada posición debe incluir:
- [ ] Score X e Y con justificación por dimensión
- [ ] Nivel de confianza (`high` / `medium` / `low`)
- [ ] Mínimo 2 fuentes primarias
- [ ] Diferenciación entre posición autopercibida y evidenciada

**Regla de fuentes compass:**
- `compassSelfPerceived`: solo fuentes oficiales del político/partido + Wikipedia. NO medios.
- `compassEvidenced`: solo fuentes primarias de evidencia (CongresoVisible, Contraloría, SUIN-Juriscol, etc.). La justificación es análisis PROPIO del proyecto basado en acciones concretas, no etiquetas de medios. Debe iniciar con "Análisis metodológico del proyecto:"

### Para incoherencias

Cada incoherencia debe incluir:
- [ ] Cita textual de la promesa + URL + fecha
- [ ] Hecho contrario documentado + URL fuente primaria + fecha
- [ ] URL archivada en [Wayback Machine](https://web.archive.org/) para ambas fuentes
- [ ] Categoría y severidad justificadas
- [ ] Revisión por al menos un colaborador

**Fuentes aceptadas** (de mayor a menor preferencia):
1. Votación oficial registrada (Congreso Visible, actas del Congreso)
2. Decreto, resolución o acto administrativo
3. Ejecución presupuestal (Contraloría, SIIF)
4. Declaración en medio de comunicación verificable
5. Programa de gobierno oficial (CNE)

**Fuentes NO aceptadas:**
- Redes sociales (Twitter/X, Facebook, Instagram) como fuente primaria
- Blogs de opinión
- Fuentes anónimas
- Capturas de pantalla sin URL verificable

---

## Revisión de PRs

Los PRs de datos son revisados por mantenedores con estos criterios:

1. **¿Las fuentes son primarias y verificables?**
2. **¿Las URLs están archivadas en Wayback Machine?**
3. **¿El JSON cumple el schema TypeScript?** (el CI lo valida automáticamente)
4. **¿La justificación del posicionamiento es coherente con los datos?**
5. **¿Hay sesgo evidente en la selección de incoherencias?**
   *(reportar solo errores de un lado del espectro es sesgo)*

---

## Proceso de disputa

Si no estás de acuerdo con el posicionamiento de una figura:

1. Abre un issue con el tag `disputa`
2. Presenta fuentes primarias que contradigan el posicionamiento actual
3. Los mantenedores revisan y responden en máximo 7 días
4. Si hay mérito, se actualiza con la nueva evidencia y se documenta el cambio

No aceptamos disputas basadas en opinión, solo en evidencia.

---

## Código de conducta

- Debate los datos, no las personas
- Cita fuentes, no intuiciones
- Acepta que la política tiene matices — el compass es una herramienta, no una sentencia
- Reportar incoherencias de todos los sectores del espectro, no solo los que no te gustan
- Trato respetuoso en issues y PRs

---

## Configuración del entorno de desarrollo

```bash
# Requisitos
node >= 20
pnpm >= 9
python >= 3.11 (solo para ETL)

# Instalación
git clone https://github.com/tu-org/brujula-politica
cd brujula-politica
pnpm install

# Desarrollo
pnpm dev          # levanta web en localhost:4321

# Validar datos
pnpm validate     # valida todos los JSON contra el schema

# Tests
pnpm test
```

---

## ¿Dudas?

Abre un [issue](https://github.com/tu-org/brujula-politica/issues) con el tag `pregunta`.
