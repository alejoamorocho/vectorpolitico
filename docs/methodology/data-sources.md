# Fuentes de datos — Colombia

> Documento vivo. Se actualiza cuando se descubren nuevas fuentes o cambia la disponibilidad.

---

## Fuentes primarias por tipo de figura

### Presidentes y candidatos presidenciales

| Fuente | Qué tiene | URL | Acceso |
|---|---|---|---|
| CNE — Registros de candidatos | Programas de gobierno oficiales | registraduria.gov.co | Público |
| Presidencia de la República | Discursos, decretos, comunicados | presidencia.gov.co | Público |
| Diario Oficial | Decretos y actos administrativos | diarioficial.gov.co | Público |
| MHCP | Presupuesto nacional, ejecución | minhacienda.gov.co | Público |
| DNP — SISMEG | Seguimiento a Plan Nacional de Desarrollo | sismeg.dnp.gov.co | Público |
| Contraloría General | Ejecución presupuestal, auditorías | contraloria.gov.co | Público |

### Congresistas (Senado y Cámara)

| Fuente | Qué tiene | URL | Acceso |
|---|---|---|---|
| **CongresoVisible (Uniandes)** | Votaciones, asistencia, ponencias, proyectos | congresovisible.uniandes.edu.co | Público — **MEJOR FUENTE** |
| Senado de la República | Proyectos de ley, actas | senado.gov.co | Público |
| Cámara de Representantes | Proyectos, debates, actas | camara.gov.co | Público |
| Registraduría | Resultados elecciones de Congreso | registraduria.gov.co | Público |
| SIGEP II | Declaraciones de bienes y actividades | sigep.gov.co | Público |

**Nota sobre CongresoVisible:** Es la fuente más estructurada para votaciones. Tienen cobertura desde 2002 y en algunos períodos tienen API informal. Contactar a Uniandes si se necesita acceso masivo.

### Gobernadores

| Fuente | Qué tiene | URL | Acceso |
|---|---|---|---|
| Gobernaciones (sitios oficiales) | Planes de desarrollo, decretos | Varía por departamento | Público |
| DNP — Planes de Desarrollo | Planes departamentales oficiales | dnp.gov.co | Público |
| Contraloría General | Ejecución presupuestal departamental | contraloria.gov.co | Público |
| Procuraduría | Sanciones disciplinarias | procuraduria.gov.co | Público |
| Registraduría | Resultados elecciones gobernadores | registraduria.gov.co | Público |

### Alcaldes (capitales de departamento)

| Fuente | Qué tiene | URL | Acceso |
|---|---|---|---|
| Alcaldías (sitios oficiales) | Planes de desarrollo, decretos | Varía por municipio | Público |
| DNP — Planes de Desarrollo | Planes municipales | dnp.gov.co | Público |
| Contraloría General | Ejecución presupuestal municipal | contraloria.gov.co | Público |
| Registraduría | Resultados elecciones alcaldes | registraduria.gov.co | Público |
| datos.gov.co | Datos abiertos varios | datos.gov.co | Público |

---

## Reglas de fuentes por tipo de posición compass

### Para `compassSelfPerceived` (Autopercepción)

Solo se aceptan fuentes que representen la voz del político o partido:

- Página web oficial del político o campaña
- Página web oficial del partido
- Wikipedia en español (como referencia neutral)
- Programa de gobierno registrado ante CNE/Registraduría
- Perfil institucional (Senado, Cámara, Alcaldía, Gobernación)

**NO se aceptan medios de comunicación** como fuente de autopercepción. Los medios interpretan — la autopercepción debe venir de lo que la figura dice de sí misma.

### Para `compassEvidenced` (Posición evidenciada)

Solo se aceptan fuentes de evidencia primaria sobre acciones concretas (ver tabla principal arriba). La justificación debe ser análisis PROPIO del proyecto — no se copian etiquetas ni caracterizaciones de medios.

### Fuentes NO aceptadas como base de posicionamiento compass

- Medios de comunicación como fuente única para compassSelfPerceived o compassEvidenced
- Redes sociales (Twitter/X, Facebook, Instagram) como fuente primaria
- Blogs de opinión o columnas que etiquetan ideológicamente
- Fuentes anónimas
- Capturas de pantalla sin URL verificable
- Análisis de think tanks con sesgo ideológico explícito (se aceptan con cross-check de fuente primaria)

**Nota:** Los medios SÍ se aceptan como fuentes de incoherencias (donde reportan hechos verificables con URL archivada) y como contexto complementario, pero nunca como base del posicionamiento compass.

---

## Fuentes para asignación de ideología (v2)

Desde la metodología v2 (2026-04-15), cada asignación de ideología a una figura se documenta con justificación y fuentes. Ver `ideology-classification.md` para el detalle completo.

### Para `ideologySelfAssignment.sources`

Mismas reglas que `compassSelfPerceived.sources`:

- página web oficial del político, campaña o partido
- Wikipedia en español
- programa de gobierno CNE/Registraduría
- estatutos/plataforma programática
- perfil institucional (Senado, Cámara, Alcaldía, Gobernación)

**NO aceptadas:** medios, redes sociales, blogs de opinión, think tanks sin cross-check.

### Para `ideologyEvidencedAssignment.sources`

Mismas reglas que `compassEvidenced.sources`:

- CongresoVisible (votaciones)
- SUIN-Juriscol / Diario Oficial (decretos)
- Contraloría (ejecución presupuestal)
- Registraduría (resultados electorales, coaliciones)
- sentencias judiciales, informes oficiales

Los medios pueden complementar como fuentes de hechos verificables, **nunca** como etiqueta ideológica.

### Validación automática

El schema Zod y Pydantic exige:

- `justification` de al menos 20 caracteres
- al menos 1 `Source` por asignación
- que `ideologyId` de `ideologySelfAssignment` coincida con `ideologySelf` (legacy) si ambos están presentes
- idéntico para `ideologyEvidencedAssignment` vs `ideologyEvidenced`

---

## Metadata obligatoria de ideologías y partidos

Para que el lector pueda verificar por sí mismo qué significa cada etiqueta y cada partido:

### `ideologies.json` (135 ideologías)

Obligatorio por ideología:

| Campo | Descripción |
|---|---|
| `id`, `name`, `x`, `y`, `width`, `height`, `quadrant`, `color`, `description` | campos base del schema |
| `wikipediaUrl` | enlace directo a Wikipedia en español (preferente) o inglés |
| `externalLinks[]` | al menos 1 fuente académica o enciclopedia política (Stanford Encyclopedia of Philosophy, Britannica, JSTOR, libros de referencia) |

Recomendado: `longDescription`, `historicalContext`, `keyThinkers`, `historicalExamples`, `relatedIdeologies`.

### `parties.json` (23 partidos)

Obligatorio por partido:

| Campo | Descripción |
|---|---|
| `id`, `name`, `fullName`, `color`, `description` | campos base del schema |
| `websiteUrl` | sitio oficial verificado del partido |
| `sources[]` | al menos 1 fuente externa: CNE, Registraduría, estatutos archivados, análisis académico |
| `compassPosition` | con `justification`, `sources[]` y `confidence` |

Recomendado: `foundedYear`, `logoUrl`, `ideologies[]`, `incoherences[]`.

### Por qué

Sin esta metadata, cuando el lector hace clic en una ideología o partido ve una etiqueta sin referencia externa. Con ella, puede verificar el significado en Wikipedia, leer fuentes académicas y validar el sitio oficial del partido. Trazabilidad completa.

---

## Fuentes para noticias (GDELT)

GDELT es la fuente principal de noticias por figura. Es gratuito y tiene cobertura de medios colombianos desde 2013.

```python
# Consulta básica GDELT para una figura
# Ver etl/fetch_news.py para implementación completa

query = f'"{nombre_figura}" sourceCountry:CO'
# Devuelve: título, URL, medio, fecha, tono (positivo/negativo/neutro)
```

**Medios colombianos cubiertos por GDELT:**
- El Tiempo, El Colombiano, El País (Cali)
- Semana, Cambio, La Silla Vacía
- Caracol, RCN, Blu Radio
- Y muchos más

**Limitación:** GDELT no cubre bien medios muy locales ni redes sociales.

---

## Calidad de los datos — advertencia importante

Los datos del gobierno colombiano son públicos pero tienen problemas conocidos:

| Problema | Frecuencia | Impacto |
|---|---|---|
| PDFs no estructurados | Muy alto | Requiere OCR/extracción manual |
| Campos vacíos en formularios | Alto | Reduce confianza de datos |
| URLs que desaparecen | Medio | Por eso archivamos en Wayback Machine |
| Inconsistencias entre períodos | Medio | Los formatos cambian entre gobiernos |
| Datos de municipios pequeños | Alto | Cobertura muy limitada |

**Regla práctica:** Si los datos de una fuente están más del 40% vacíos para lo que necesitas, documenta `confidence: "low"` y busca fuente alternativa.

---

## Fuentes a evaluar (pendiente)

Estas fuentes existen pero aún no hemos evaluado su calidad o accesibilidad:

- [ ] **ParlAmericas** — datos comparativos de congresos latinoamericanos
- [ ] **LAPOP (Vanderbilt)** — encuestas de opinión pública sobre figuras
- [ ] **V-Dem** — índices de democracia (útil para contexto, no para figuras individuales)
- [ ] **Función Pública / SIGEP II directo** — patrimonios declarados
- [ ] **CNE — financiación de campañas** — donantes, montos (para roadmap)

---

## Cómo agregar una nueva fuente a este documento

Si descubres una fuente útil:
1. Verifica que sea pública y estable
2. Documenta qué tiene, para qué sirve y sus limitaciones
3. PR a este archivo con la nueva fila en la tabla correspondiente
