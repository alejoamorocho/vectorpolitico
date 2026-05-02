/**
 * @brujula/schema — entrada pública del paquete.
 *
 * Exporta los tipos TypeScript canónicos y los schemas Zod isomorfos.
 * Todo código del monorepo (apps/web, apps/api, scripts) debe importar
 * desde aquí para mantener consistencia.
 */

export * from './types';
export * as zod from './zod';
