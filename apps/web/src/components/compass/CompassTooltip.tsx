/** Tooltip flotante del compass (hover sobre figura / partido / ideología). */

export type TooltipState = {
  kind: 'entity' | 'ideology' | 'party';
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  meta?: string[];
} | null;

export function CompassTooltip({ tooltip, size }: { tooltip: TooltipState; size: number }) {
  if (!tooltip) return null;
  return (
    <div
      className="compass-tooltip"
      data-click-through
      style={{
        left: Math.min(tooltip.x + 16, size - 280),
        top: Math.min(tooltip.y + 16, size - 120),
      }}
    >
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          margin: 0,
          color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
        }}
      >
        {tooltip.title}
      </p>
      {tooltip.subtitle && (
        <p
          style={{
            fontSize: 10,
            margin: '3px 0 0',
            color: 'var(--ink-mute)',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          {tooltip.subtitle}
        </p>
      )}
      {tooltip.meta && tooltip.meta.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '8px 0 0',
            fontSize: 12,
            color: 'var(--ink-soft)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          {tooltip.meta.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
