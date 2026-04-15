import type { EntitySummary } from '@brujula/schema';
import type React from 'react';
import type { CompassScales } from '../lib/projection';

type Props = {
  entities: EntitySummary[];
  scales: CompassScales;
  focusedId?: string | null;
  showArrows?: boolean;
  showSelfPerceived?: boolean;
  showEvidenced?: boolean;
  onHover?: (entity: EntitySummary | null, ev?: React.MouseEvent) => void;
  onClick?: (id: string) => void;
};

/**
 * Por cada entidad renderiza:
 *   1. <ArrowPath> desde autopercibido -> evidenciado
 *   2. <circle> azul con ring blanco (autopercibido)
 *   3. <circle> rojo con ring blanco (evidenciado)
 *   4. Halo pulsante si esta focused
 *
 * Sombras sutiles con drop-shadow filter para elevar los puntos sobre la cuadricula.
 */
export function EntityPoints({
  entities,
  scales,
  focusedId = null,
  showArrows = true,
  showSelfPerceived = true,
  showEvidenced = true,
  onHover,
  onClick,
}: Props) {
  const { xScale, yScale } = scales;

  return (
    <g aria-label="Figuras politicas">
      {entities.map((e) => {
        const sx = xScale(e.compassSelfPerceived.x);
        const sy = yScale(e.compassSelfPerceived.y);
        const ex = xScale(e.compassEvidenced.x);
        const ey = yScale(e.compassEvidenced.y);

        const isFocused = focusedId === e.id;
        const isDimmed = focusedId !== null && !isFocused;

        return (
          <g
            key={e.id}
            data-click-through=""
            opacity={isDimmed ? 0.18 : 1}
            style={{ transition: 'opacity 250ms ease', cursor: 'pointer' }}
            onClick={(ev) => {
              ev.stopPropagation();
              onClick?.(e.id);
            }}
            onMouseEnter={(ev) => onHover?.(e, ev)}
            onMouseMove={(ev) => onHover?.(e, ev)}
            onMouseLeave={() => onHover?.(null)}
            role="button"
            tabIndex={0}
            aria-label={`${e.displayName}`}
          >
            {/* Flecha autopercibido -> evidenciado */}
            {showArrows && showSelfPerceived && showEvidenced && <ArrowPath x1={sx} y1={sy} x2={ex} y2={ey} />}

            {/* Touch targets invisibles (44px min para mobile) */}
            {showSelfPerceived && <circle cx={sx} cy={sy} r={16} fill="transparent" stroke="none" />}
            {showEvidenced && <circle cx={ex} cy={ey} r={16} fill="transparent" stroke="none" />}

            {/* Punto autopercibido (azul) */}
            {showSelfPerceived && (
              <circle
                cx={sx}
                cy={sy}
                r={5}
                fill="#1e3556"
                stroke="#fdfaf1"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                filter="url(#entity-shadow)"
              />
            )}

            {/* Punto evidenciado (rojo) */}
            {showEvidenced && (
              <circle
                cx={ex}
                cy={ey}
                r={5}
                fill="#6b1f1f"
                stroke="#fdfaf1"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                filter="url(#entity-shadow)"
              />
            )}

            {/* Halo pulsante cuando esta focused */}
            {isFocused && (
              <>
                {showSelfPerceived && (
                  <circle
                    cx={sx}
                    cy={sy}
                    r={11}
                    fill="none"
                    stroke="#1e3556"
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                    vectorEffect="non-scaling-stroke"
                  >
                    <animate
                      attributeName="r"
                      values="9;14;9"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {showEvidenced && (
                  <circle
                    cx={ex}
                    cy={ey}
                    r={11}
                    fill="none"
                    stroke="#6b1f1f"
                    strokeWidth={1.5}
                    strokeOpacity={0.6}
                    vectorEffect="non-scaling-stroke"
                  >
                    <animate
                      attributeName="r"
                      values="9;14;9"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

function ArrowPath({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  if (len < 3) return null;

  const ux = dx / len;
  const uy = dy / len;
  const headLen = 7;
  const px = -uy;
  const py = ux;

  const backoff = 6;
  const hx = x2 - ux * headLen;
  const hy = y2 - uy * headLen;
  const lineStart = { x: x1 + ux * backoff, y: y1 + uy * backoff };
  const lineEnd = { x: x2 - ux * backoff, y: y2 - uy * backoff };

  return (
    <g
      stroke="#3d3d3d"
      strokeWidth={1.4}
      strokeLinecap="round"
      fill="#3d3d3d"
      opacity={0.75}
    >
      <line
        x1={lineStart.x}
        y1={lineStart.y}
        x2={lineEnd.x}
        y2={lineEnd.y}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M ${x2 - ux * backoff * 0.4} ${y2 - uy * backoff * 0.4}
            L ${hx + (px * headLen) / 2.2} ${hy + (py * headLen) / 2.2}
            L ${hx - (px * headLen) / 2.2} ${hy - (py * headLen) / 2.2} Z`}
      />
    </g>
  );
}
