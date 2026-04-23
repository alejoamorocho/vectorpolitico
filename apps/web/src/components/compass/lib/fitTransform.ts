import { zoomIdentity, type ZoomTransform } from 'd3-zoom';

/**
 * Calcula un ZoomTransform que escala y centra un contenido de
 * `contentWidth × contentHeight` dentro de un viewport de
 * `viewportWidth × viewportHeight`, preservando aspect ratio y
 * dejando un margen relativo.
 *
 * @param viewportWidth  ancho disponible del contenedor (px)
 * @param viewportHeight alto disponible del contenedor (px)
 * @param contentWidth   ancho del contenido a encajar (px)
 * @param contentHeight  alto del contenido a encajar (px)
 * @param margin         fracción de margen en cada lado (0.05 = 5%)
 */
export function computeFitTransform(
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
  margin = 0.05,
): ZoomTransform {
  if (
    viewportWidth <= 0 ||
    viewportHeight <= 0 ||
    contentWidth <= 0 ||
    contentHeight <= 0
  ) {
    return zoomIdentity;
  }
  const usableW = viewportWidth * (1 - 2 * margin);
  const usableH = viewportHeight * (1 - 2 * margin);
  const k = Math.min(usableW / contentWidth, usableH / contentHeight);
  const tx = (viewportWidth - contentWidth * k) / 2;
  const ty = (viewportHeight - contentHeight * k) / 2;
  return zoomIdentity.translate(tx, ty).scale(k);
}
