# Cómo replicar Brújula Política para otro país

Esta guía es para equipos o comunidades que quieren adaptar el framework a su país. El objetivo es que el proceso sea lo más autónomo posible.

---

## Filosofía de expansión

Brújula Política está diseñado para que **cada país sea mantenido por su propia comunidad local**. Nadie conoce mejor la política venezolana que venezolanos, la mexicana que mexicanos, etc.

El rol del repositorio central es:
- Mantener el framework técnico (el compass, el schema, el frontend)
- Garantizar que la metodología sea consistente entre países
- Revisar que los PRs cumplan el estándar de fuentes

El rol de la comunidad local es:
- Reunir y curar los datos de su país
- Mantener actualizadas las figuras
- Identificar las mejores fuentes primarias locales

---

## Paso 1 — Verifica que tu país cumple el mínimo

Para agregar un país necesitas tener disponibles **al menos**:

- [ ] Fuente de programas de gobierno oficiales (candidatos presidenciales)
- [ ] Fuente de resultados electorales oficiales
- [ ] Fuente de votaciones legislativas (congreso, asamblea, etc.)
- [ ] Al menos 3 colaboradores comprometidos con el mantenimiento

Sin estas fuentes, los datos serán de confianza `low` casi siempre, lo que limita el valor del proyecto.

---

## Paso 2 — Abre un issue de propuesta de país

```
Title: [PAÍS] Propuesta de expansión — [Nombre del país]
Label: nuevo-pais
```

Incluye:
- Las fuentes primarias disponibles para tu país
- Quiénes serán los mantenedores locales
- Qué figuras planean documentar primero

Los mantenedores del proyecto central revisarán y aprobarán.

---

## Paso 3 — Crea la estructura de datos

```bash
# Código ISO 3166-1 alpha-2 de tu país
# Venezuela: ve, México: mx, Chile: cl, etc.

mkdir -p packages/data/{codigo-pais}

# Crea los archivos base (pueden estar vacíos al inicio)
touch packages/data/{codigo-pais}/parties.json
touch packages/data/{codigo-pais}/presidents.json
touch packages/data/{codigo-pais}/candidates.json
touch packages/data/{codigo-pais}/senators.json      # o equivalente legislativo
touch packages/data/{codigo-pais}/representatives.json
touch packages/data/{codigo-pais}/governors.json
touch packages/data/{codigo-pais}/mayors.json
touch packages/data/{codigo-pais}/README.md          # fuentes específicas del país
```

---

## Paso 4 — Documenta las fuentes de tu país

Crea `packages/data/{codigo-pais}/README.md` con:

```markdown
# Fuentes de datos — [País]

## Presidentes y candidatos
| Fuente | URL | Cobertura |
|---|---|---|
| ... | ... | ... |

## Congreso / Asamblea / Parlamento
| Fuente | URL | Cobertura |
|---|---|---|
| ... | ... | ... |

## Gobernadores / Estados / Regiones
...

## Alcaldes
...

## Notas específicas del sistema político
<!-- Diferencias con Colombia que el schema debe contemplar -->
<!-- Ej: sistema federal, cámaras distintas, períodos diferentes, etc. -->
```

---

## Paso 5 — Adapta el schema si es necesario

El schema base está diseñado para Colombia pero es flexible. Si tu país tiene particularidades:

```typescript
// Ejemplos de adaptaciones que pueden ser necesarias:

// México: presidente 6 años sin reelección, estados en vez de departamentos
// Venezuela: asamblea unicameral, gobernadores por estados
// Chile: sistema binominal histórico, distinción senadores/diputados
// Argentina: sistema federal, diferencia provincia/ciudad autónoma
```

Abre un PR al schema con los cambios necesarios y la justificación.

---

## Paso 6 — Empieza con los presidentes

La recomendación es siempre empezar con presidentes porque:
1. Tienen la mayor relevancia histórica
2. Sus programas de gobierno están mejor documentados
3. Sus acciones son más fáciles de verificar
4. Atraen más colaboradores al proyecto

Apunta a tener **5-10 presidentes** bien documentados antes de lanzar.

---

## Paso 7 — PR de incorporación

Cuando tengas mínimo 5 figuras documentadas con el estándar completo:

```bash
git checkout -b country/add-{codigo-pais}
# Agrega todos los archivos de tu país
git commit -m "data({codigo}): initial data — {N} presidents"
```

El PR debe incluir:
- Los JSONs de datos
- El README de fuentes del país
- Las adaptaciones de schema si las hubo
- Los nombres de los mantenedores locales (GitHub usernames)

---

## Mantenimiento continuo

Una vez incorporado, el país necesita mantenedores que:
- Actualicen figuras cuando hay cambios de cargo
- Agreguen figuras nuevas con cada elección
- Respondan issues sobre datos de ese país
- Revisen PRs de la comunidad local

**Sin mantenedores activos, el país puede marcarse como `unmaintained` en el sitio.**

---

## Países en progreso

| País | Estado | Mantenedores | Issues |
|---|---|---|---|
| 🇨🇴 Colombia | ✅ Activo | @ssi-cali | — |
| 🇻🇪 Venezuela | 🔄 Propuesto | — | #XX |
| 🇲🇽 México | 🔄 Propuesto | — | #XX |

¿Quieres liderar un país? Abre un issue.
