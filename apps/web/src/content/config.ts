import { defineCollection, z } from 'astro:content';

/**
 * Astro Content Collections — Wiki de metodología.
 *
 * Todo el contenido de la wiki se guarda como markdown con frontmatter
 * validado por Zod. El build falla si algún archivo tiene frontmatter
 * inválido, lo que garantiza que no haya drift entre la estructura esperada
 * y el contenido real.
 *
 * Para añadir un nuevo documento:
 *   1. Crear `src/content/methodology/<slug>.md`
 *   2. Incluir frontmatter con todos los campos requeridos
 *   3. El build lo detecta automáticamente y lo renderiza en /metodologia/<slug>
 */

const methodology = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(5).max(120),
    description: z.string().min(20).max(300),
    order: z.number().int().nonnegative(),
    section: z.enum(['compass', 'incoherence', 'data', 'contributing', 'adr']),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    lastUpdated: z.coerce.date(),
    authors: z.array(z.string()).min(1),
    relatedDocs: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { methodology };
