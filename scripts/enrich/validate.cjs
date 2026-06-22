/**
 * Validación de los JSON de datos contra réplicas fieles de los schemas zod
 * del proyecto (packages/schema/src/zod.ts). Es el mismo conjunto de reglas que
 * usa el build de Astro, de modo que si esto pasa, el build no fallará por datos.
 *
 * Uso: node scripts/enrich/validate.cjs [ideologies|parties|politicians|all]
 */
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const ROOT = path.resolve(__dirname, '..', '..');
const D = path.join(ROOT, 'packages', 'data');

const score = z.number().min(-10).max(10);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const country = z.string().regex(/^[a-z]{2}$/);
const hex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
const url = z.string().url();
const entityType = z.enum(['president','vice_president','presidential_candidate','vp_candidate','senator','representative','governor','mayor']);
const incCat = z.enum(['economia','seguridad','derechos_humanos','medio_ambiente','corrupcion','relaciones_exteriores','educacion','salud']);
const severity = z.enum(['low','medium','high']);
const confidence = z.enum(['low','medium','high']);
const quadrant = z.enum(['auth_left','auth_right','lib_left','lib_right']);

const source = z.object({ url, title: z.string().min(3).max(300).optional(), outlet: z.string().min(2).max(200), date: isoDate, archived: url.optional() });
const period = z.object({ role: entityType, startDate: isoDate, endDate: isoDate.optional(), region: z.string().min(2).max(120).optional(), electedWith: z.number().min(0).max(100).optional() })
  .refine((p) => !p.endDate || p.endDate >= p.startDate, { message: 'endDate>=startDate' });
const dimensionScores = z.object({ fiscalPolicy: score, marketPosition: score, socialPolicy: score, tradePolicy: score, civilRights: score, securityApproach: score, socialRights: score, powerConcentration: score });
const compassPosition = z.object({ x: score, y: score, justification: z.string().min(20).max(5000).optional(), sources: z.array(source).optional(), confidence: confidence.optional() });
const evidencedCompass = compassPosition.extend({ confidence, dimensionScores });
const incStatement = z.object({ text: z.string().min(10).max(2000), source: source.extend({ archived: url }) });
const incoherence = z.object({ id: slug, category: incCat, severity, verified: z.boolean(), verifiedBy: z.string().min(1).max(100).optional(), proposal: incStatement, action: incStatement, nuances: z.string().max(2000).optional(), addedBy: z.string().min(1).max(100), addedAt: isoDate })
  .refine((i) => !i.verified || (i.verifiedBy && i.verifiedBy.length > 0));
const externalLink = z.object({ title: z.string().min(2).max(200), url, outlet: z.string().min(2).max(200).optional() });
const ideologyAssignment = z.object({ ideologyId: slug, justification: z.string().min(20).max(3000), sources: z.array(source).min(1) });

const ideologySchema = z.object({
  id: slug, name: z.string().min(2).max(120), nameEn: z.string().min(2).max(120).optional(),
  x: score, y: score, width: z.number().positive().max(20), height: z.number().positive().max(20),
  quadrant, color: hex, description: z.string().min(20).max(3000),
  longDescription: z.string().min(50).max(10000).optional(), historicalContext: z.string().min(20).max(5000).optional(),
  contemporaryRelevance: z.string().min(20).max(3000).optional(), commonCriticisms: z.string().min(20).max(3000).optional(),
  keyThinkers: z.array(z.string().min(2).max(120)).optional(), historicalExamples: z.array(z.string().min(2).max(200)).optional(),
  relatedIdeologies: z.array(slug).optional(), wikipediaUrl: url.optional(), externalLinks: z.array(externalLink).optional(),
});
const partySchema = z.object({
  id: slug, country, name: z.string().min(2).max(120), fullName: z.string().min(2).max(200), color: hex,
  logoUrl: url.optional(), websiteUrl: url.optional(), foundedYear: z.number().int().min(1800).max(2100).optional(),
  dissolvedYear: z.number().int().min(1800).max(2100).optional(), description: z.string().min(20).max(3000),
  ideologies: z.array(slug), compassPosition: compassPosition.optional(), sources: z.array(source).optional(),
  incoherences: z.array(incoherence).default([]), lastUpdated: isoDate, contributors: z.array(z.string().min(1).max(100)),
});
const entitySchema = z.object({
  id: slug, country, type: entityType, fullName: z.string().min(3).max(200), displayName: z.string().min(2).max(120),
  photoUrl: url.optional(), party: slug.nullish(),
  vpFormula: z.object({ fullName: z.string().min(3).max(200), shortName: z.string().min(2).max(120).optional(), bio: z.string().min(10).max(3000).optional() }).optional(),
  periods: z.array(period).min(1), compassSelfPerceived: compassPosition, compassEvidenced: evidencedCompass,
  ideologies: z.array(slug), ideologySelf: slug.optional(), ideologyEvidenced: slug.optional(),
  ideologySelfAssignment: ideologyAssignment.optional(), ideologyEvidencedAssignment: ideologyAssignment.optional(),
  bio: z.string().min(50).max(5000), incoherences: z.array(incoherence), lastUpdated: isoDate, contributors: z.array(z.string().min(1).max(100)).min(1),
});

function validateFile(file, schema, label) {
  const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
  let ok = 0; const errs = [];
  for (const item of arr) {
    const r = schema.safeParse(item);
    if (r.success) ok++;
    else errs.push(`${item.id}: ` + r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  }
  console.log(`${label}: ${ok}/${arr.length} válidos` + (errs.length ? ` — ${errs.length} con errores` : ' ✓'));
  errs.slice(0, 25).forEach((e) => console.log('   ✗', e));
  return errs.length === 0;
}

const which = process.argv[2] || 'all';
let allOk = true;
if (which === 'ideologies' || which === 'all') allOk &= validateFile(path.join(D, 'ideologies.json'), ideologySchema, 'Ideologías');
if (which === 'parties' || which === 'all') allOk &= validateFile(path.join(D, 'colombia', 'parties.json'), partySchema, 'Partidos');
if (which === 'politicians' || which === 'all') {
  for (const f of ['presidents','vice-presidents','senators','representatives','candidates','vp-candidates','governors','mayors'])
    allOk &= validateFile(path.join(D, 'colombia', f + '.json'), entitySchema, 'Políticos/' + f);
}
process.exit(allOk ? 0 : 1);
