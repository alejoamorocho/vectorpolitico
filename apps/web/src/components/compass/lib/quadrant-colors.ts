import type { Ideology } from '@brujula/schema';

type ColorRole = 'fill' | 'stroke' | 'label' | 'bg';

/**
 * Paleta gazette — pastel MUY sobrio, sincronizada con las CSS variables en :root.
 * Rosa polvo, azul polvo, verde salvia, dorado trigo.
 */
const COLORS: Record<Ideology['quadrant'], Record<ColorRole, string>> = {
  auth_left: {
    fill: '#ebd9d9',
    stroke: '#c89999',
    label: '#5c1818',
    bg: '#f3e6e6',
  },
  auth_right: {
    fill: '#d9dfe8',
    stroke: '#96a9c4',
    label: '#1a2e4f',
    bg: '#e4e9f0',
  },
  lib_left: {
    fill: '#d9e3dc',
    stroke: '#9bb8a3',
    label: '#1d3a26',
    bg: '#e4ede7',
  },
  lib_right: {
    fill: '#ebddb9',
    stroke: '#c4ad6c',
    label: '#4a3608',
    bg: '#f1e6c8',
  },
};

export function quadrantColor(quadrant: Ideology['quadrant'], role: ColorRole): string {
  return COLORS[quadrant][role];
}

export const QUADRANT_META: Record<
  Ideology['quadrant'],
  { title: string; short: string; ink: string }
> = {
  auth_left: { title: 'Izquierda Autoritaria', short: 'Izq. Auth.', ink: '#5c1818' },
  auth_right: { title: 'Derecha Autoritaria', short: 'Der. Auth.', ink: '#1a2e4f' },
  lib_left: { title: 'Izquierda Libertaria', short: 'Izq. Lib.', ink: '#1d3a26' },
  lib_right: { title: 'Derecha Libertaria', short: 'Der. Lib.', ink: '#4a3608' },
};
