## Tipo de PR

<!-- Marca con x lo que aplica -->

- [ ] 📊 Datos — nueva figura política
- [ ] 📊 Datos — actualización de figura existente
- [ ] ⚠️ Datos — nueva incoherencia documentada
- [ ] 🐛 Fix — corrección de dato incorrecto
- [ ] ✨ Feature — nueva funcionalidad
- [ ] 🔧 Chore — mantenimiento / dependencias
- [ ] 📝 Docs — documentación

---

## Descripción

<!-- ¿Qué hace este PR? Sé específico. -->

---

## Checklist general

- [ ] El código/datos pasan `pnpm validate` sin errores
- [ ] El mensaje de commit sigue Conventional Commits
- [ ] La rama tiene nombre descriptivo (`data/add-X`, `fix/Y`, `feat/Z`)

---

## Si es un PR de datos (figura política)

### Figura(s) agregada(s) o modificada(s)
<!-- Nombre completo, cargo, período -->

### Posicionamiento en el compass

| | Autopercibido | Evidenciado |
|---|---|---|
| Eje X (económico) | | |
| Eje Y (social) | | |
| Confianza | | |

### Fuentes primarias incluidas
<!-- Lista las fuentes principales que respaldan el posicionamiento -->
- [ ] Fuente 1: 
- [ ] Fuente 2:
- [ ] Fuente 3:

### ¿Las URLs están archivadas en Wayback Machine?
- [ ] Sí, todas
- [ ] Parcialmente — explica cuáles no y por qué

---

## Si incluye incoherencias nuevas

Por cada incoherencia, confirma:

- [ ] Cita textual de la promesa con URL + fecha
- [ ] Hecho contrario con fuente primaria (no Twitter) + fecha
- [ ] Ambas URLs archivadas en Wayback Machine
- [ ] Categoría y severidad asignadas y justificadas
- [ ] No hay sesgo de selección (¿estás reportando solo incoherencias de un sector?)

---

## Si es un PR técnico (feature / fix)

- [ ] Incluye descripción del problema que resuelve
- [ ] Si agrega UI: incluye screenshot o grabación
- [ ] Si cambia el schema de datos: está documentado el impacto en datos existentes
- [ ] No rompe el build (`pnpm build` pasa)

---

## Contexto adicional

<!-- Cualquier cosa que el revisor deba saber -->

---

## Issues relacionados

<!-- Cierra #número o Relacionado con #número -->
