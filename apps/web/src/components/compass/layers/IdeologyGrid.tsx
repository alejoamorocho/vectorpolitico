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
 * Estrategia de legibilidad por zoom:
 *   - Muy pequeña (<18px): solo rect coloreado, sin label.
 *   - Pequeña (18-35px): label truncado en 1 línea, fuente mínima.
 *   - Mediana (35-60px): label en 1-2 líneas.
 *   - Grande (>60px): label completo con wrap en hasta 3 líneas.
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

        const showNothing = effectiveMin < 18;
        const showTiny = effectiveMin >= 18 && effectiveMin < 35;
        const showMedium = effectiveMin >= 35 && effectiveMin < 60;
        const showFull = effectiveMin >= 60;

        const isMuted = highlightedIds !== null && !highlightedIds.has(ide.id);

        // Font size: scale with cell size but clamp
        const baseFontSize = Math.min(w, h) * 0.14;
        const fontSize = showTiny
          ? Math.max(4.5, Math.min(7, baseFontSize))
          : showMedium
            ? Math.max(5.5, Math.min(9, baseFontSize))
            : Math.max(6, Math.min(11, baseFontSize));

        const fill = quadrantColor(ide.quadrant, 'fill');
        const stroke = quadrantColor(ide.quadrant, 'stroke');
        const labelInk = quadrantColor(ide.quadrant, 'label');

        const label = (showTiny || showMedium) ? truncate(ide.name, w, fontSize) : ide.name;
        const labelLines = showFull ? wrapText(ide.name, w * 0.9, fontSize) : [label];

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
            {/* Cell background */}
            <rect
              x={left}
              y={top}
              width={w}
              height={h}
              fill={fill}
              stroke={stroke}
              strokeWidth={0.6}
              strokeOpacity={0.7}
              vectorEffect="non-scaling-stroke"
            />

            {/* No label for tiny cells */}
            {showNothing && null}

            {/* Single-line label */}
            {(showTiny || showMedium) && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="compass-label"
                fill={labelInk}
                fontSize={fontSize}
              >
                {label}
              </text>
            )}

            {/* Full multi-line label */}
            {showFull &&
              labelLines.map((line, i) => (
                <text
                  key={i}
                  x={cx}
                  y={cy + (i - (labelLines.length - 1) / 2) * fontSize * 1.18}
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

function truncate(text: string, widthPx: number, fontSize: number): string {
  const charWidth = fontSize * 0.52;
  const maxChars = Math.floor((widthPx * 0.88) / charWidth);
  if (text.length <= maxChars) return text;
  if (maxChars < 4) return text.slice(0, Math.max(1, maxChars));
  return text.slice(0, maxChars - 1) + '\u2026';
}

function wrapText(text: string, widthPx: number, fontSize: number): string[] {
  const charWidth = fontSize * 0.52;
  const maxChars = Math.floor(widthPx / charWidth);
  if (text.length <= maxChars) return [text];

  const words = text.split(' ');
  if (words.length === 1) {
    return [truncate(text, widthPx, fontSize)];
  }

  // Try to split into 2 or 3 lines
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

  // Limit to 3 lines, truncate last if needed
  if (lines.length > 3) {
    const first3 = lines.slice(0, 3);
    first3[2] = truncate(first3[2], widthPx, fontSize);
    return first3;
  }

  return lines;
}
