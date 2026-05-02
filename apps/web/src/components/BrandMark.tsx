import { Compass } from '@phosphor-icons/react';

type Props = {
  size?: number;
  showLabel?: boolean;
};

/**
 * Marca del sitio — icono de compass (Phosphor) + título con serif.
 * Reemplaza el emoji 🧭 con un icono editorial sobrio.
 */
export default function BrandMark({ size = 22, showLabel = true }: Props) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        color: 'var(--ink)',
      }}
    >
      <Compass size={size} weight="duotone" />
      {showLabel && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}
        >
          La Brújula
        </span>
      )}
    </span>
  );
}
