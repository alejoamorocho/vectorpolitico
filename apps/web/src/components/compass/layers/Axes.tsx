import type { CompassScales } from '../lib/projection';

type Props = {
  scales: CompassScales;
  size: number;
  showQuadrantLabels?: boolean;
};

/**
 * Líneas y flechas de los ejes — se renderizan DEBAJO del grid de ideologías
 * para que las celdas las cubran y no "atraviesen" el contenido.
 */
export function AxisLines({ scales, size }: { scales: CompassScales; size: number }) {
  const { xScale, yScale } = scales;
  const cx = xScale(0);
  const cy = yScale(0);

  const arrowSize = size * 0.012;
  // Margin so lines end before the outermost ideology cells
  const axisMargin = size * 0.04;

  return (
    <g aria-hidden="true">
      {/* Eje horizontal (Y=0) */}
      <line
        x1={axisMargin}
        y1={cy}
        x2={size - axisMargin}
        y2={cy}
        stroke="#1a1510"
        strokeWidth={1.5}
        strokeOpacity={0.35}
        vectorEffect="non-scaling-stroke"
      />
      {/* Flecha izquierda */}
      <polygon
        points={`${axisMargin},${cy} ${axisMargin + arrowSize * 2.2},${cy - arrowSize} ${axisMargin + arrowSize * 2.2},${cy + arrowSize}`}
        fill="#1a1510"
        fillOpacity={0.35}
      />
      {/* Flecha derecha */}
      <polygon
        points={`${size - axisMargin},${cy} ${size - axisMargin - arrowSize * 2.2},${cy - arrowSize} ${size - axisMargin - arrowSize * 2.2},${cy + arrowSize}`}
        fill="#1a1510"
        fillOpacity={0.35}
      />

      {/* Eje vertical (X=0) */}
      <line
        x1={cx}
        y1={axisMargin}
        x2={cx}
        y2={size - axisMargin}
        stroke="#1a1510"
        strokeWidth={1.5}
        strokeOpacity={0.35}
        vectorEffect="non-scaling-stroke"
      />
      {/* Flecha arriba */}
      <polygon
        points={`${cx},${axisMargin} ${cx - arrowSize},${axisMargin + arrowSize * 2.2} ${cx + arrowSize},${axisMargin + arrowSize * 2.2}`}
        fill="#1a1510"
        fillOpacity={0.35}
      />
      {/* Flecha abajo */}
      <polygon
        points={`${cx},${size - axisMargin} ${cx - arrowSize},${size - axisMargin - arrowSize * 2.2} ${cx + arrowSize},${size - axisMargin - arrowSize * 2.2}`}
        fill="#1a1510"
        fillOpacity={0.35}
      />
    </g>
  );
}

/**
 * Etiquetas de eje y cuadrante + crosshair de referencia sutil.
 * Se renderizan ENCIMA del grid para que los ejes sean visibles como guía.
 */
export function AxisLabels({ scales, size, showQuadrantLabels = true }: Props) {
  const { xScale, yScale } = scales;
  const cx = xScale(0);
  const cy = yScale(0);

  const axisLabelSize = size * 0.019;
  const quadLabelSize = size * 0.015;
  const pad = size * 0.025;
  const axisMargin = size * 0.04;

  const labelProps = {
    fontFamily: "var(--font-display, 'Playfair Display', serif)",
    fontSize: axisLabelSize,
    fontWeight: 700 as const,
    fontStyle: 'italic' as const,
    fill: '#1a1510',
    fillOpacity: 0.8,
    paintOrder: 'stroke fill' as const,
    stroke: '#fdfaf1',
    strokeWidth: 4,
    strokeLinejoin: 'round' as const,
    strokeOpacity: 0.9,
  };

  const arrowSize = size * 0.012;

  return (
    <g aria-label="Ejes del compass">
      {/* Flechas cardinales sobre el grid — pequeñas, sólo en los bordes */}
      <polygon
        points={`${axisMargin},${cy} ${axisMargin + arrowSize * 2.2},${cy - arrowSize} ${axisMargin + arrowSize * 2.2},${cy + arrowSize}`}
        fill="#1a1510"
        fillOpacity={0.55}
      />
      <polygon
        points={`${size - axisMargin},${cy} ${size - axisMargin - arrowSize * 2.2},${cy - arrowSize} ${size - axisMargin - arrowSize * 2.2},${cy + arrowSize}`}
        fill="#1a1510"
        fillOpacity={0.55}
      />
      <polygon
        points={`${cx},${axisMargin} ${cx - arrowSize},${axisMargin + arrowSize * 2.2} ${cx + arrowSize},${axisMargin + arrowSize * 2.2}`}
        fill="#1a1510"
        fillOpacity={0.55}
      />
      <polygon
        points={`${cx},${size - axisMargin} ${cx - arrowSize},${size - axisMargin - arrowSize * 2.2} ${cx + arrowSize},${size - axisMargin - arrowSize * 2.2}`}
        fill="#1a1510"
        fillOpacity={0.55}
      />
      {/* Etiquetas cardinales */}
      <text
        x={pad + axisLabelSize * 0.3}
        y={cy + axisLabelSize * 0.18}
        dominantBaseline="middle"
        {...labelProps}
      >
        Izquierda
      </text>
      <text
        x={size - pad - axisLabelSize * 0.3}
        y={cy + axisLabelSize * 0.18}
        textAnchor="end"
        dominantBaseline="middle"
        {...labelProps}
      >
        Derecha
      </text>
      <text
        x={cx}
        y={pad + axisLabelSize * 0.6}
        textAnchor="middle"
        dominantBaseline="middle"
        {...labelProps}
      >
        Autoritario
      </text>
      <text
        x={cx}
        y={size - pad - axisLabelSize * 0.4}
        textAnchor="middle"
        dominantBaseline="middle"
        {...labelProps}
      >
        Libertario
      </text>

      {showQuadrantLabels && (
        <>
          <text
            x={pad}
            y={pad + quadLabelSize * 2}
            className="compass-quadrant-label"
            fill="#5c1818"
            fontSize={quadLabelSize}
            dominantBaseline="hanging"
            fillOpacity={0.3}
          >
            Izquierda Autoritaria
          </text>
          <text
            x={size - pad}
            y={pad + quadLabelSize * 2}
            className="compass-quadrant-label"
            fill="#1a2e4f"
            fontSize={quadLabelSize}
            dominantBaseline="hanging"
            textAnchor="end"
            fillOpacity={0.3}
          >
            Derecha Autoritaria
          </text>
          <text
            x={pad}
            y={size - pad - quadLabelSize}
            className="compass-quadrant-label"
            fill="#1d3a26"
            fontSize={quadLabelSize}
            fillOpacity={0.3}
          >
            Izquierda Libertaria
          </text>
          <text
            x={size - pad}
            y={size - pad - quadLabelSize}
            className="compass-quadrant-label"
            fill="#4a3608"
            fontSize={quadLabelSize}
            textAnchor="end"
            fillOpacity={0.3}
          >
            Derecha Libertaria
          </text>
        </>
      )}
    </g>
  );
}

/** @deprecated Use AxisLines + AxisLabels separately for proper layering */
export function Axes(props: Props) {
  return (
    <>
      <AxisLines scales={props.scales} size={props.size} />
      <AxisLabels {...props} />
    </>
  );
}
