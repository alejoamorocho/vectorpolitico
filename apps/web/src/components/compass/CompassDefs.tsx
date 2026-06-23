/** Definiciones SVG reutilizables del compass (gradiente de fondo, sombra, patrón). */

export function CompassDefs() {
  return (
    <defs>
      <linearGradient id="compass-bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fdfaf1" />
        <stop offset="100%" stopColor="#f5efe2" />
      </linearGradient>
      <filter id="entity-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.28" />
      </filter>
      {/* Patrón tipo grabado antiguo — líneas diagonales finas */}
      <pattern id="paper-lines" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#1a1510" strokeWidth="0.3" strokeOpacity="0.03" />
      </pattern>
    </defs>
  );
}
