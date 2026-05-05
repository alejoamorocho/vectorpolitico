import type { Ideology } from '@brujula/schema';
import { quadrantColor } from '../lib/quadrant-colors';
import type { CompassScales } from '../lib/projection';

type Props = {
  ideologies: Ideology[];
  scales: CompassScales;
  zoomK: number;
  size: number;
  highlightedIds?: Set<string> | null;
  onIdeologyClick?: (id: string) => void;
};

/**
 * Renderiza la grilla de ideologías como un mosaico perfecto sin gaps.
 *
 * Estrategia de legibilidad por zoom — ninguna celda queda completamente vacía,
 * siempre se muestra al menos un indicador (iniciales o palabra abreviada):
 *   - Micro    (<10px):     solo color de fondo + dot central de marcador.
 *   - Iniciales (10-22px):  iniciales mayúsculas (DC, ML, etc.) — al menos hint de identidad.
 *   - Tiny     (22-40px):   palabra clave o nombre truncado a 1 línea.
 *   - Medium   (40-65px):   nombre en 1-2 líneas.
 *   - Grande   (>65px):     nombre completo con wrap en hasta 3 líneas.
 */
export function IdeologyGrid({
  ideologies,
  scales,
  zoomK,
  size,
  highlightedIds = null,
  onIdeologyClick,
}: Props) {
  const { xScale, yScale } = scales;

  // Sin gap — mosaico perfecto como la imagen de referencia
  const GAP = 0;

  return (
    <g aria-label="Cuadricula de ideologias">
      {ideologies.map((ide) => {
        const halfW = ide.width / 2 - GAP;
        const halfH = ide.height / 2 - GAP;
        const left = xScale(ide.x - halfW);
        const right = xScale(ide.x + halfW);
        const top = yScale(ide.y + halfH);
        const bottom = yScale(ide.y - halfH);
        const w = right - left;
        const h = bottom - top;
        if (w <= 0 || h <= 0) return null;

        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;

        const effectiveW = w * zoomK;
        const effectiveH = h * zoomK;
        const effectiveMin = Math.min(effectiveW, effectiveH);

        // Cinco modos de label, asegurando que ninguna celda quede vacía
        const mode: 'micro' | 'initials' | 'tiny' | 'medium' | 'full' =
          effectiveMin < 10
            ? 'micro'
            : effectiveMin < 22
              ? 'initials'
              : effectiveMin < 40
                ? 'tiny'
                : effectiveMin < 65
                  ? 'medium'
                  : 'full';

        const isMuted = highlightedIds !== null && !highlightedIds.has(ide.id);

        // Font size: escala con tamaño de celda con clamp
        const minSide = Math.min(w, h);
        const baseFontSize = minSide * 0.16;
        const fontSize =
          mode === 'micro'
            ? 0
            : mode === 'initials'
              ? Math.max(5, Math.min(8, minSide * 0.32))
              : mode === 'tiny'
                ? Math.max(5.5, Math.min(8, baseFontSize))
                : mode === 'medium'
                  ? Math.max(6.5, Math.min(10, baseFontSize))
                  : Math.max(7, Math.min(12, baseFontSize));

        const fill = quadrantColor(ide.quadrant, 'fill');
        const stroke = quadrantColor(ide.quadrant, 'stroke');
        const labelInk = quadrantColor(ide.quadrant, 'label');

        const labelText =
          mode === 'initials'
            ? getInitials(ide.name)
            : mode === 'tiny' || mode === 'medium'
              ? truncate(ide.name, w, fontSize)
              : ide.name;

        const fullLines = mode === 'full' ? wrapText(ide.name, w * 0.9, fontSize) : [labelText];

        return (
          <g
            key={ide.id}
            className="compass-cell"
            data-click-through={onIdeologyClick ? '' : undefined}
            style={{
              opacity: isMuted ? 0.18 : 1,
              cursor: onIdeologyClick ? 'pointer' : 'default',
              transition: 'opacity 300ms ease',
            }}
            onClick={(e) => {
              if (!onIdeologyClick) return;
              e.stopPropagation();
              onIdeologyClick(ide.id);
            }}
            aria-label={ide.name}
          >
            <title>{ide.name}</title>

            {/* Cell background */}
            <rect
              x={left}
              y={top}
              width={w}
              height={h}
              fill={fill}
              stroke={stroke}
              strokeWidth={0.6}
              strokeOpacity={0.75}
              vectorEffect="non-scaling-stroke"
              className="compass-cell-rect"
            />

            {/* Hover stroke overlay (más visible) */}
            <rect
              x={left}
              y={top}
              width={w}
              height={h}
              fill="transparent"
              stroke={stroke}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              className="compass-cell-hover"
              style={{ opacity: 0, transition: 'opacity 150ms ease', pointerEvents: 'none' }}
            />

            {/* Micro: dot central que indica que hay celda clickable */}
            {mode === 'micro' && (
              <circle
                cx={cx}
                cy={cy}
                r={Math.max(0.6, minSide * 0.06)}
                fill={labelInk}
                opacity={0.45}
              />
            )}

            {/* Initials: iniciales centradas */}
            {mode === 'initials' && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="compass-label compass-label-initials"
                fill={labelInk}
                fontSize={fontSize}
                fontWeight={700}
                style={{ letterSpacing: '0.02em' }}
              >
                {labelText}
              </text>
            )}

            {/* Single-line label */}
            {(mode === 'tiny' || mode === 'medium') && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="compass-label"
                fill={labelInk}
                fontSize={fontSize}
              >
                {labelText}
              </text>
            )}

            {/* Full multi-line label */}
            {mode === 'full' &&
              fullLines.map((line, i) => (
                <text
                  key={i}
                  x={cx}
                  y={cy + (i - (fullLines.length - 1) / 2) * fontSize * 1.2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="compass-label"
                  fill={labelInk}
                  fontSize={fontSize}
                >
                  {line}
                </text>
              ))}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Devuelve hasta 3 iniciales para nombres compuestos.
 *  "Democracia Cristiana"     → "DC"
 *  "Marxismo-leninismo"       → "ML"
 *  "Anarco-capitalismo"       → "AC"
 *  "Capitalismo Autoritario"  → "CA"
 *  "Sionismo"                 → "SI"
 *  "IngSoc"                   → "IS"
 */
function getInitials(name: string): string {
  // Separar por espacios y guiones
  const tokens = name
    .split(/[\s\-—–·/]+/)
    .filter(Boolean)
    .filter((t) => t.length > 0 && !isStopWord(t));
  if (tokens.length >= 2) {
    return (tokens[0][0] + tokens[1][0]).toUpperCase();
  }
  // Una sola palabra: tomar primeras 2 letras
  const single = tokens[0] ?? name;
  return single.slice(0, 2).toUpperCase();
}

function isStopWord(token: string): boolean {
  const lower = token.toLowerCase();
  return ['de', 'del', 'la', 'el', 'los', 'las', 'y', 'en'].includes(lower);
}

function truncate(text: string, widthPx: number, fontSize: number): string {
  const charWidth = fontSize * 0.52;
  const maxChars = Math.floor((widthPx * 0.9) / charWidth);
  if (text.length <= maxChars) return text;
  if (maxChars < 4) return text.slice(0, Math.max(1, maxChars));
  return text.slice(0, maxChars - 1) + '…';
}

function wrapText(text: string, widthPx: number, fontSize: number): string[] {
  const charWidth = fontSize * 0.52;
  const maxChars = Math.floor(widthPx / charWidth);
  if (text.length <= maxChars) return [text];

  const words = text.split(' ');
  if (words.length === 1) {
    return [truncate(text, widthPx, fontSize)];
  }

  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (test.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  if (lines.length > 3) {
    const first3 = lines.slice(0, 3);
    first3[2] = truncate(first3[2], widthPx, fontSize);
    return first3;
  }

  return lines;
}
