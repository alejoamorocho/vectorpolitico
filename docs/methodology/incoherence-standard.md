# Metodología: Estándar para publicar incoherencias

> **Versión:** 1.0.0
> **Última revisión:** 2026-04-10

---

## ¿Qué es una incoherencia en Brújula Política?

Una incoherencia es una **contradicción documentada y verificable** entre:
- Lo que una figura política dijo, prometió o declaró públicamente
- Lo que esa misma figura hizo cuando tuvo la oportunidad de actuar

No es un juicio moral. Es un registro de hechos con fuentes.

---

## Los 5 requisitos obligatorios

Sin estos 5 elementos, el PR **no se fusiona**. Sin excepciones.

### ✅ 1. La promesa — cita textual con fuente y fecha
```json
{
  "proposal": "Garantizo que no habrá extractivismo en páramos durante mi gobierno",
  "proposalSource": {
    "quote": "Garantizo que no habrá extractivismo en páramos durante mi gobierno",
    "url": "https://...",
    "outlet": "El Tiempo",
    "date": "2022-03-15",
    "archived": "https://web.archive.org/web/2022.../..."
  }
}
```

**Reglas para la promesa:**
- Debe ser una declaración específica, no una posición vaga
- Cita textual entre comillas, no paráfrasis
- La fuente debe ser accesible y verificable

### ✅ 2. La acción contraria — hecho verificable con fuente primaria
```json
{
  "action": "Firmó Decreto 1234 de 2023 autorizando exploración minera en zona de páramo del Sumapaz",
  "actionSource": {
    "url": "https://www.suin-juriscol.gov.co/...",
    "outlet": "Diario Oficial",
    "date": "2023-08-20",
    "archived": "https://web.archive.org/web/2023.../..."
  }
}
```

**Jerarquía de fuentes primarias (de mayor a menor):**
1. 🥇 Votación oficial registrada (actas del Congreso, CongresoVisible)
2. 🥈 Decreto, resolución o acto administrativo (Diario Oficial)
3. 🥉 Ejecución presupuestal (Contraloría, SIIF Nación)
4. 📋 Declaración oficial en rueda de prensa o documento gubernamental
5. 📰 Reportaje de medio verificable con documentación de respaldo

### ✅ 3. Archivado en Wayback Machine
Ambas URLs (promesa y acción) deben estar archivadas en [web.archive.org](https://web.archive.org).

**¿Por qué?** Los sitios web cambian, las páginas desaparecen, los artículos se editan. El archivo garantiza que la evidencia no pueda ser borrada.

**Cómo archivar:**
```
1. Ve a https://web.archive.org/save
2. Pega la URL
3. Copia la URL del archivo resultante
4. Inclúyela en el campo "archived"
```

### ✅ 4. Categoría y severidad justificadas

**Categorías disponibles:**
- `economia` — política fiscal, empleo, crecimiento, deuda
- `seguridad` — orden público, fuerzas armadas, paz
- `derechos_humanos` — DDHH, justicia, minorías
- `medio_ambiente` — ecosistemas, extractivismo, cambio climático
- `corrupcion` — transparencia, contratación, patrimonio
- `relaciones_exteriores` — política internacional, acuerdos
- `educacion` — cobertura, calidad, inversión educativa
- `salud` — sistema de salud, cobertura, medicamentos

**Severidad:**
| Nivel | Criterio |
|---|---|
| `high` | Contradicción directa, documentada, en tema central de su campaña/cargo |
| `medium` | Contradicción en tema secundario, o con circunstancias que añaden matiz |
| `low` | Cambio de posición con algún contexto que lo explica parcialmente |

### ✅ 5. Revisión por un colaborador distinto al que lo subió

El colaborador que sube la incoherencia no puede ser el único que la valida. Un mantenedor o colaborador activo debe revisar que:
- Las fuentes son reales y dicen lo que se afirma
- No hay tergiversación de contexto
- La severidad está bien calibrada

---

## Lo que NO es una incoherencia publicable

| Situación | Por qué no |
|---|---|
| "Dijo X pero yo creo que hace Y" | Sin fuente de la acción |
| "Cambió de opinión sobre Z" | Cambiar de posición no es incoherencia si hay contexto |
| "Su partido hizo A pero él dijo B" | La incoherencia debe ser de la misma persona |
| Tweet de 2012 vs discurso de 2024 | Evolución en 12 años tiene contexto — analizar con cuidado |
| "Según fuentes cercanas..." | Fuentes anónimas no se aceptan |
| Captura de pantalla sin URL | No verificable |

---

## Sobre el sesgo de selección

Este es el riesgo más serio del proyecto: **que se documente solo las incoherencias de un sector del espectro político.**

Eso convertiría a Brújula Política en propaganda, no en herramienta educativa.

**Los mantenedores revisarán activamente** que haya equilibrio en las incoherencias documentadas por espectro político. Un colaborador que solo reporta incoherencias de figuras de un sector será invitado a contribuir también del otro.

No pedimos neutralidad política a los colaboradores — pedimos **consistencia en el estándar.**

---

## JSON completo de una incoherencia

```json
{
  "id": "petro-paramos-2023",
  "entityId": "gustavo-petro",
  "category": "medio_ambiente",
  "severity": "high",
  "verified": true,
  "verifiedBy": "github-username",
  "proposal": {
    "text": "Garantizo que no habrá extractivismo en páramos durante mi gobierno",
    "source": {
      "url": "https://eltie.mp/...",
      "outlet": "El Tiempo",
      "date": "2022-03-15",
      "archived": "https://web.archive.org/web/20220315.../..."
    }
  },
  "action": {
    "text": "El gobierno expidió el Decreto 1234 de 2023 autorizando exploración en zona de amortiguación del páramo del Sumapaz",
    "source": {
      "url": "https://www.suin-juriscol.gov.co/decreto-1234-2023",
      "outlet": "Diario Oficial",
      "date": "2023-08-20",
      "archived": "https://web.archive.org/web/20230820.../..."
    }
  },
  "nuances": "El gobierno argumentó que la zona autorizada es 'amortiguación' y no páramo estricto según IDEAM. Ambientalistas disputan esta clasificación.",
  "addedBy": "github-username",
  "addedAt": "2026-04-10"
}
```

El campo `nuances` es opcional pero muy valioso — permite documentar el contexto sin relativizar la incoherencia.
