import { useMemo } from 'react';
import type { Party } from '@brujula/schema';
import type React from 'react';
import type { CompassScales } from '../lib/projection';

const CLUSTER_RADIUS = 0.55;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Offsets de racimo para partidos que comparten el centroide de una ideología. */
function computePartyOffsets(parties: Party[]): Map<string, { dx: number; dy: number }> {
  const groups = new Map<string, Party[]>();
  for (const p of parties) {
    if (!p.compassPosition) continue;
    const k = `${Math.round(p.compassPosition.x * 2) / 2},${Math.round(p.compassPosition.y * 2) / 2}`;
    const arr = groups.get(k) ?? [];
    arr.push(p);
    groups.set(k, arr);
  }
  const out = new Map<string, { dx: number; dy: number }>();
  for (const [, members] of groups) {
    const n = members.length;
    if (n === 1) {
      out.set(members[0].id, { dx: 0, dy: 0 });
      continue;
    }
    const sorted = [...members].sort((a, b) => a.id.localeCompare(b.id));
    for (let i = 0; i < sorted.length; i++) {
      const t = i / (n - 1);
      const r = CLUSTER_RADIUS * Math.sqrt(t);
      const theta = i * GOLDEN_ANGLE;
      out.set(sorted[i].id, { dx: r * Math.cos(theta), dy: r * Math.sin(theta) });
    }
  }
  return out;
}

type Props = {
  parties: Party[];
  scales: CompassScales;
  zoomK: number;
  focusedId?: string | null;
  onHover?: (party: Party | null, ev?: React.MouseEvent) => void;
  onClick?: (id: string) => void;
};

/**
 * Renderiza cada partido con compassPosition como un diamante (rotado 45°)
 * con el color del partido. Más grande que los puntos de entidades para
 * distinguirse como "anclas" del partido en el compass.
 */
export function PartyPoints({
  parties,
  scales,
  zoomK,
  focusedId = null,
  onHover,
  onClick,
}: Props) {
  const { xScale, yScale } = scales;
  const showLabels = zoomK >= 1.8;
  const offsets = useMemo(() => computePartyOffsets(parties), [parties]);

  return (
    <g aria-label="Partidos políticos">
      {parties
        .filter((p) => p.compassPosition)
        .map((p) => {
          const off = offsets.get(p.id) ?? { dx: 0, dy: 0 };
          const cx = xScale(p.compassPosition!.x + off.dx);
          const cy = yScale(p.compassPosition!.y + off.dy);
          const isFocused = focusedId === p.id;
          const isDimmed = focusedId !== null && !isFocused;

          // Diamond: 4 points around cx,cy (rotated square)
          const r = 8;
          const diamond = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;

          return (
            <g
              key={p.id}
              data-click-through=""
              opacity={isDimmed ? 0.25 : 1}
              style={{ transition: 'opacity 250ms ease', cursor: 'pointer' }}
              onClick={(ev) => {
                ev.stopPropagation();
                onClick?.(p.id);
              }}
              onMouseEnter={(ev) => onHover?.(p, ev)}
              onMouseMove={(ev) => onHover?.(p, ev)}
              onMouseLeave={() => onHover?.(null)}
              role="button"
              tabIndex={0}
              aria-label={p.name}
            >
              {/* Invisible larger hit area */}
              <polygon
                points={`${cx},${cy - 18} ${cx + 18},${cy} ${cx},${cy + 18} ${cx - 18},${cy}`}
                fill="transparent"
              />
              {/* White halo for contrast against grid */}
              <polygon
                points={`${cx},${cy - (r + 2)} ${cx + r + 2},${cy} ${cx},${cy + r + 2} ${cx - (r + 2)},${cy}`}
                fill="#fdfaf1"
                opacity={0.9}
              />
              {/* Main colored diamond */}
              <polygon
                points={diamond}
                fill={p.color}
                stroke="#1a1510"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                filter="url(#entity-shadow)"
              />

              {/* Label — only shown at moderate zoom */}
              {showLabels && (
                <text
                  x={cx}
                  y={cy + r + 12}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="var(--font-display, serif)"
                  fontWeight={700}
                  fill="#1a1510"
                  paintOrder="stroke fill"
                  stroke="#fdfaf1"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {p.name}
                </text>
              )}

              {isFocused && (
                <polygon
                  points={`${cx},${cy - 14} ${cx + 14},${cy} ${cx},${cy + 14} ${cx - 14},${cy}`}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={2}
                  strokeOpacity={0.6}
                  vectorEffect="non-scaling-stroke"
                >
                  <animate
                    attributeName="stroke-opacity"
                    values="0.2;0.7;0.2"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </polygon>
              )}
            </g>
          );
        })}
    </g>
  );
}
