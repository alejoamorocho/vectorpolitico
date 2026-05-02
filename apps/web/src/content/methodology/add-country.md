---
title: Cómo agregar un nuevo país
description: Guía para replicar Brújula Política en otro país de Latinoamérica con su propio dataset.
order: 50
section: contributing
version: 1.0.0
lastUpdated: 2026-04-10
authors:
  - ssi-co
---

## Filosofía

Brújula Política está diseñada para ser **replicable**. El framework es genérico; los datos son específicos por país.

Para agregar un nuevo país solo necesitas:

1. Un directorio `packages/data/<código-iso>/` con los JSON del país
2. Documentación de fuentes primarias del país
3. Opcionalmente, traducciones de la wiki

## Pasos

### 1. Crear el directorio del país

```bash
mkdir -p packages/data/ve  # Venezuela
# estructura estándar:
packages/data/ve/
├── parties.json
├── presidents.json
├── senators.json
├── representatives.json
├── candidates.json
├── governors.json
└── mayors.json
```

### 2. Documentar fuentes primarias del país

Crea `apps/web/src/content/methodology/data-sources-<código>.md` con la tabla de fuentes específica:

- Congreso / Asamblea Nacional — dónde están las votaciones
- Órgano electoral — resultados
- Contraloría / equivalente — ejecución presupuestal
- Diarios oficiales — decretos y resoluciones

### 3. Seguir el mismo estándar de datos

Todas las reglas del [estándar de incoherencias](/metodologia/incoherence-standard) aplican sin cambios. La metodología es universal.

### 4. Ideologías

El archivo `packages/data/ideologies.json` es **compartido entre países** — el compass es el mismo. Si tu país tiene una corriente ideológica particular (ej. peronismo en Argentina, chavismo en Venezuela), agrégala al `ideologies.source.yaml` global, no a un archivo específico del país.

### 5. Traducciones (opcional)

Si el idioma del país no es español, las páginas deberán traducirse. El sistema actual es monolingüe (es-CO), pero el framework soporta i18n con Astro nativo cuando llegue el momento.

## Países candidatos (roadmap)

- 🇻🇪 Venezuela
- 🇲🇽 México
- 🇨🇱 Chile
- 🇦🇷 Argentina
- 🇵🇪 Perú
- 🇪🇨 Ecuador

El orden depende de disponibilidad de fuentes primarias y de contribuidores locales comprometidos con el estándar.
