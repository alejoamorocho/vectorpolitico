/**
 * Proyección entre coordenadas data (-10..+10) y coordenadas SVG (0..viewBox).
 *
 * El eje Y se invierte porque en data +10 = autoritario (arriba en la UI)
 * mientras que en SVG y crece hacia abajo.
 */

import { scaleLinear, type ScaleLinear } from 'd3-scale';

export type CompassScales = {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

/**
 * Construye las escalas dado un viewBox cuadrado.
 * @param size Tamaño del viewBox (mismo valor para width y height — el compass es cuadrado)
 */
export function createScales(size: number): CompassScales {
  return {
    xScale: scaleLinear().domain([-10, 10]).range([0, size]),
    // Y invertido: data +10 → top (y=0), data -10 → bottom (y=size)
    yScale: scaleLinear().domain([-10, 10]).range([size, 0]),
  };
}
