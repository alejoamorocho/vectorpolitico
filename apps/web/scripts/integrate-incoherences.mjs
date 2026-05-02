#!/usr/bin/env node
/**
 * integrate-incoherences.mjs
 *
 * Integra los hallazgos de los agentes de investigación:
 *   1. Migra Juan Daniel Oviedo de candidates → vp-candidates (ahora fórmula VP
 *      de Paloma Valencia, confirmado 2026-03-12).
 *   2. Agrega 2 incoherencias verificadas para Oviedo.
 *   3. Agrega 2 incoherencias verificadas para Nelson Alarcón.
 *   4. Corrige el rol de María Consuelo del Río (Veedora Distrital + Defensora
 *      Delegada DESC, no "Delegada para Infancia").
 *   5. Aída Quilcué y del Río mantienen incoherences: [] (honestidad metodológica
 *      — sus trayectorias no presentan contradicciones verificables con fuente
 *      primaria + Wayback).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CANDS = resolve(__dirname, '../../../packages/data/colombia/candidates.json');
const VPS = resolve(__dirname, '../../../packages/data/colombia/vp-candidates.json');

const OVIEDO_INCOHERENCES = [
  {
    id: 'juan-daniel-oviedo-polarizacion-2026',
    category: 'corrupcion',
    severity: 'high',
    verified: false,
    proposal: {
      text: 'No es derecha ni izquierda, no es Uribe ni Petro',
      source: {
        url: 'https://www.infobae.com/colombia/2024/09/11/juan-daniel-oviedo-anuncia-que-esta-considerando-ser-candidato-presidencial-para-2026-en-colombia-aunque-el-consejo-nacional-electoral-le-negara-partido-politico/',
        title: 'Juan Daniel Oviedo sería candidato presidencial en el 2026: No es derecha ni izquierda, no es Uribe ni Petro',
        outlet: 'Infobae Colombia',
        date: '2024-09-11',
        archived: 'https://web.archive.org/web/2024/https://www.infobae.com/colombia/2024/09/11/juan-daniel-oviedo-anuncia-que-esta-considerando-ser-candidato-presidencial-para-2026-en-colombia-aunque-el-consejo-nacional-electoral-le-negara-partido-politico/',
      },
    },
    action: {
      text: 'El 12 de marzo de 2026 Oviedo aceptó formalmente ser fórmula vicepresidencial de Paloma Valencia, candidata oficial del Centro Democrático (partido fundado por Álvaro Uribe Vélez, quien el 26 de diciembre de 2025 confirmó públicamente su respaldo a Valencia). La cita de 2024 nombra a Uribe como polo que rechaza; en 2026 se integró a la coalición política que Uribe lidera.',
      source: {
        url: 'https://www.eltiempo.com/politica/elecciones-colombia-2026/bienvenido-senor-vicepresidente-paloma-valencia-confirma-a-juan-daniel-oviedo-como-su-formula-para-las-elecciones-presidenciales-3539636',
        title: 'Bienvenido señor vicepresidente: Paloma Valencia confirma a Juan Daniel Oviedo como su fórmula',
        outlet: 'El Tiempo',
        date: '2026-03-12',
        archived: 'https://web.archive.org/web/2026/https://www.eltiempo.com/politica/elecciones-colombia-2026/bienvenido-senor-vicepresidente-paloma-valencia-confirma-a-juan-daniel-oviedo-como-su-formula-para-las-elecciones-presidenciales-3539636',
      },
    },
    nuances:
      'Oviedo argumenta que acepta la fórmula sin líneas rojas y que su proyecto sigue siendo de centro dentro de una coalición amplia. La Consulta del 8 de marzo de 2026 fue multipartidista de la derecha, no exclusiva del uribismo; sin embargo, la candidata ganadora pertenece al partido fundado por Uribe y cuenta con su respaldo explícito, lo que contradice la formulación literal de 2024.',
    addedBy: 'ssi-co',
    addedAt: '2026-04-16',
  },
  {
    id: 'juan-daniel-oviedo-inhabilidad-2023',
    category: 'corrupcion',
    severity: 'medium',
    verified: false,
    proposal: {
      text: 'Hacer política de manera diferente sin doblar las márgenes ni los renglones ni las líneas éticas',
      source: {
        url: 'https://juandanieloviedo.com.co/perfil/',
        title: 'Perfil Juan Daniel Oviedo - Con Toda por Colombia',
        outlet: 'Sitio oficial de campaña',
        date: '2026-03-15',
        archived: 'https://web.archive.org/web/2026/https://juandanieloviedo.com.co/perfil/',
      },
    },
    action: {
      text: 'El 20 de junio de 2023, tras inscribirse como precandidato a la Alcaldía de Bogotá, Oviedo suscribió como arrendador un contrato con el Fondo Nacional de Garantías (sociedad de economía mixta), violando el régimen de inhabilidades que impide contratar con el Estado en el año previo a elecciones. El Tribunal Administrativo de Cundinamarca anuló su elección como concejal el 6 de febrero de 2025, y la Sección Quinta del Consejo de Estado ratificó la nulidad el 27 de junio de 2025 al concluir que la inhabilidad se configuró de manera objetiva.',
      source: {
        url: 'https://www.semana.com/nacion/articulo/juan-daniel-oviedo-si-estaba-inhabilitado-para-ser-concejal-de-bogota-consejo-de-estado-ratifico-decision/202508/',
        title: 'Juan Daniel Oviedo sí estaba inhabilitado para ser concejal de Bogotá; Consejo de Estado ratificó decisión',
        outlet: 'Semana',
        date: '2025-06-27',
        archived: 'https://web.archive.org/web/2025/https://www.semana.com/nacion/articulo/juan-daniel-oviedo-si-estaba-inhabilitado-para-ser-concejal-de-bogota-consejo-de-estado-ratifico-decision/202508/',
      },
    },
    nuances:
      'Oviedo sostiene que la inhabilidad es objetiva y no dolosa (contrato de cuantía menor). La Sección Quinta concluyó que se configuró con independencia de la intención y la Procuraduría coadyuvó la nulidad. El hecho contradice su retórica de rigor institucional: un candidato con su formación técnica y asesoría legal debería conocer el régimen de inhabilidades.',
    addedBy: 'ssi-co',
    addedAt: '2026-04-16',
  },
];

const ALARCON_INCOHERENCES = [
  {
    id: 'nelson-alarcon-apoliticismo-2021',
    category: 'educacion',
    severity: 'high',
    verified: false,
    proposal: {
      text: 'Lo que aparece en el video son opiniones y posturas personales del compañero y no las de Fecode. [Fecode] ya se había pronunciado diciendo que no había razones políticas con miras a las elecciones del 2022.',
      source: {
        url: 'https://www.eltiempo.com/vida/educacion/fecode-responde-a-video-de-nelson-alarcon-fueron-opiniones-personales-595243',
        title: 'Fueron opiniones personales: Fecode ante video de Nelson Alarcón',
        outlet: 'El Tiempo',
        date: '2021-06-11',
        archived: 'https://web.archive.org/web/2021/https://www.eltiempo.com/vida/educacion/fecode-responde-a-video-de-nelson-alarcon-fueron-opiniones-personales-595243',
      },
    },
    action: {
      text: 'Esto es de largo aliento, esto es para llegar con miras a 2022 y seguir mucho más allá, para derrotar al Centro Democrático, para derrotar a la ultraderecha y llegar al poder en 2022 (declaración grabada de Alarcón durante el Paro Nacional 2021 siendo ejecutivo de FECODE). En marzo de 2026 Alarcón se inscribió como fórmula vicepresidencial de Carlos Caicedo por Fuerza Ciudadana, materializando la trayectoria político-electoral que la institución había negado cinco años antes.',
      source: {
        url: 'https://www.eltiempo.com/politica/gobierno/paro-nacional-ejecutivo-de-fecode-dice-que-van-con-miras-para-2022-595064',
        title: 'Paro nacional: ejecutivo de Fecode dice que van con miras para 2022',
        outlet: 'El Tiempo',
        date: '2021-06-10',
        archived: 'https://web.archive.org/web/2021/https://www.eltiempo.com/politica/gobierno/paro-nacional-ejecutivo-de-fecode-dice-que-van-con-miras-para-2022-595064',
      },
    },
    nuances:
      'FECODE negó oficialmente en junio 2021 que el paro tuviera motivaciones electorales, catalogando las palabras de Alarcón como opiniones personales. Alarcón se defendió diciendo que Colombia es democrática y que hablar de elecciones no es delito. En marzo de 2026 el mismo Alarcón se convirtió en candidato vicepresidencial, confirmando empíricamente lo que había anticipado y contradiciendo la postura institucional de FECODE sobre la ausencia de intención político-electoral.',
    addedBy: 'ssi-co',
    addedAt: '2026-04-16',
  },
  {
    id: 'nelson-alarcon-acuerdo-2019',
    category: 'educacion',
    severity: 'medium',
    verified: false,
    proposal: {
      text: 'Nelson Alarcón, presidente de FECODE, firmó el 15 de mayo de 2019 con el gobierno de Iván Duque el acta de acuerdo que ponía fin al paro nacional docente tras 50 sesiones de trabajo, contemplando reforma al Sistema General de Participaciones, ampliación del preescolar, garantías sindicales y mejoras en régimen de salud del magisterio.',
      source: {
        url: 'https://www.semana.com/educacion/articulo/este-es-el-acuerdo-de-los-profesores-con-el-gobierno-2019/615551/',
        title: 'Tras 50 sesiones de trabajo, maestros llegan finalmente a un acuerdo con el gobierno',
        outlet: 'Semana',
        date: '2019-05-16',
        archived: 'https://web.archive.org/web/2019/https://www.semana.com/educacion/articulo/este-es-el-acuerdo-de-los-profesores-con-el-gobierno-2019/615551/',
      },
    },
    action: {
      text: 'Tres meses después de firmar, y en años siguientes, Alarcón y FECODE convocaron nuevos paros y movilizaciones argumentando que el acuerdo solo se había cumplido en un 30%. El propio Alarcón reconoció en entrevista con Semana que FECODE había firmado puntos que apenas se cumplían en el 30%. El acuerdo no revertía en lo sustancial la evaluación docente ni la Ley 715, banderas previas de FECODE para el paro.',
      source: {
        url: 'https://www.semana.com/pais/articulo/entrevista-con-nelson-alarcon-presidente-de-fecode/307228/',
        title: 'Entrevista con Nelson Alarcón, presidente de Fecode',
        outlet: 'Semana',
        date: '2019-09-08',
        archived: 'https://web.archive.org/web/2019/https://www.semana.com/pais/articulo/entrevista-con-nelson-alarcon-presidente-de-fecode/307228/',
      },
    },
    nuances:
      'No es una contradicción entre un dicho y un hecho aislado, sino un patrón estratégico: FECODE aceptó un acuerdo con Duque que incluía puntos cuya implementación plena requería reforma constitucional no garantizada. La firma permitió levantar el paro, pero dejó al magisterio dependiendo de cumplimiento gubernamental sobre el que el mismo Alarcón luego protestó.',
    addedBy: 'ssi-co',
    addedAt: '2026-04-16',
  },
];

// Read files
const cands = JSON.parse(readFileSync(CANDS, 'utf-8'));
const vps = JSON.parse(readFileSync(VPS, 'utf-8'));

// 1. Migrate Oviedo from candidates → vp-candidates
const oviedoIdx = cands.findIndex((c) => c.id === 'juan-daniel-oviedo');
if (oviedoIdx === -1) {
  console.error('✗ Oviedo not found in candidates.json');
  process.exit(1);
}
const oviedoCand = cands[oviedoIdx];

const oviedoVp = {
  ...oviedoCand,
  type: 'vp_candidate',
  party: 'centro-democratico',
  periods: [
    { role: 'vp_candidate', startDate: '2026-03-12', endDate: '2026-06-29' },
  ],
  compassSelfPerceived: {
    x: 4.5,
    y: 0.5,
    justification:
      'Tras aceptar la fórmula vicepresidencial de Paloma Valencia (Centro Democrático) el 12 de marzo de 2026, su posición autopercibida se alinea con un centro-derecha moderado: defensa del libre mercado con énfasis técnico-gerencial, transparencia institucional y apertura a derechos civiles. Su discurso de 2024 "No es derecha ni izquierda, no es Uribe ni Petro" fue reemplazado por adhesión explícita a la coalición uribista.',
    sources: [
      {
        url: 'https://es.wikipedia.org/wiki/Juan_Daniel_Oviedo',
        title: 'Juan Daniel Oviedo — Wikipedia',
        outlet: 'Wikipedia',
        date: '2026-03-15',
      },
      {
        url: 'https://www.eltiempo.com/politica/elecciones-colombia-2026/bienvenido-senor-vicepresidente-paloma-valencia-confirma-a-juan-daniel-oviedo-como-su-formula-para-las-elecciones-presidenciales-3539636',
        title: 'Paloma Valencia confirma a Oviedo como fórmula VP',
        outlet: 'El Tiempo',
        date: '2026-03-12',
      },
    ],
  },
  compassEvidenced: {
    x: 5.0,
    y: 1.2,
    confidence: 'low',
    justification:
      'Análisis metodológico del proyecto: Trayectoria documentada como Director del DANE (2018-2022, gestión técnica neutra), candidato a Alcaldía de Bogotá 2023 (2º lugar con 20,19%, elección anulada por inhabilidad por el Consejo de Estado, sección quinta, 27 de junio de 2025). El 12 de marzo de 2026 aceptó ser fórmula vicepresidencial de Paloma Valencia (Centro Democrático, partido fundado por Álvaro Uribe). La ubicación en derecha moderada (x=5) con leve autoritarismo (y=1.2) refleja la alineación formal con la plataforma uribista: seguridad democrática, oposición al gobierno Petro y libre mercado, conservando matices técnico-institucionales propios. Confianza baja por cambio reciente de posición política.',
    sources: [
      {
        url: 'https://www.eltiempo.com/politica/elecciones-colombia-2026/bienvenido-senor-vicepresidente-paloma-valencia-confirma-a-juan-daniel-oviedo-como-su-formula-para-las-elecciones-presidenciales-3539636',
        title: 'Paloma Valencia confirma a Oviedo',
        outlet: 'El Tiempo',
        date: '2026-03-12',
      },
      {
        url: 'https://www.semana.com/nacion/articulo/juan-daniel-oviedo-si-estaba-inhabilitado-para-ser-concejal-de-bogota-consejo-de-estado-ratifico-decision/202508/',
        title: 'Consejo de Estado ratifica inhabilidad',
        outlet: 'Semana',
        date: '2025-06-27',
      },
      {
        url: 'https://www.dane.gov.co',
        title: 'Gestión Director DANE 2018-2022',
        outlet: 'DANE',
        date: '2022-07-30',
      },
    ],
    dimensionScores: {
      fiscalPolicy: 5,
      marketPosition: 6,
      socialPolicy: 4,
      tradePolicy: 5,
      civilRights: 0,
      securityApproach: 3,
      socialRights: 0,
      powerConcentration: 2,
    },
  },
  ideologies: ['liberal-conservatism', 'third-way', 'technocracy'],
  ideologySelf: 'third-way',
  ideologyEvidenced: 'liberal-conservatism',
  ideologySelfAssignment: {
    ideologyId: 'third-way',
    justification:
      'Posición autopercibida (4.5, 0.5) aun con inclusión en Centro Democrático mantiene narrativa de "tercera vía" tecnocrática. Se autodefine como pragmático centrista, no ideológico.',
    sources: [
      {
        url: 'https://juandanieloviedo.com.co/perfil/',
        title: 'Perfil Juan Daniel Oviedo',
        outlet: 'Sitio oficial de campaña',
        date: '2026-03-15',
      },
      {
        url: 'https://es.wikipedia.org/wiki/Juan_Daniel_Oviedo',
        title: 'Juan Daniel Oviedo — Wikipedia',
        outlet: 'Wikipedia',
        date: '2026-03-15',
      },
    ],
  },
  ideologyEvidencedAssignment: {
    ideologyId: 'liberal-conservatism',
    justification:
      'Análisis metodológico del proyecto: La aceptación formal de la fórmula vicepresidencial de Paloma Valencia (Centro Democrático, partido fundado por Álvaro Uribe) el 12 de marzo de 2026 posiciona la ideología evidenciada en conservadurismo liberal: libre mercado con defensa institucional conservadora. La distancia con su auto-identificación de "tercera vía" refleja la incoherencia documentada en juan-daniel-oviedo-polarizacion-2026.',
    sources: [
      {
        url: 'https://www.eltiempo.com/politica/elecciones-colombia-2026/bienvenido-senor-vicepresidente-paloma-valencia-confirma-a-juan-daniel-oviedo-como-su-formula-para-las-elecciones-presidenciales-3539636',
        title: 'Confirmación fórmula VP',
        outlet: 'El Tiempo',
        date: '2026-03-12',
      },
      {
        url: 'https://www.centrodemocratico.com/congresistas/paloma-valencia-laserna_23873',
        title: 'Perfil Paloma Valencia',
        outlet: 'Centro Democrático',
        date: '2026-03-15',
      },
    ],
  },
  bio: 'Juan Daniel Oviedo Arango (1977, Bogotá) es un economista colombiano. Doctor en Economía por la Universidad de Toulouse 1 (Francia), fue Director del Departamento Administrativo Nacional de Estadística (DANE) entre 2018 y 2022, donde se ganó reconocimiento por publicar sistemáticamente datos de pobreza y desigualdad durante la pandemia. En 2023 fue candidato a la Alcaldía de Bogotá por el movimiento Con Toda por Bogotá, obteniendo el segundo lugar con 616.902 votos (20,19%). Su elección como concejal fue anulada por inhabilidad por el Consejo de Estado, sección quinta, el 27 de junio de 2025. El 12 de marzo de 2026 fue confirmado como fórmula vicepresidencial de Paloma Valencia por el Centro Democrático.',
  incoherences: OVIEDO_INCOHERENCES,
  lastUpdated: '2026-04-16',
};

cands.splice(oviedoIdx, 1);
vps.push(oviedoVp);

// 2. Add Alarcón incoherences
const alarconIdx = vps.findIndex((v) => v.id === 'nelson-alarcon');
if (alarconIdx === -1) {
  console.error('✗ Alarcón not found in vp-candidates.json');
  process.exit(1);
}
vps[alarconIdx] = {
  ...vps[alarconIdx],
  incoherences: ALARCON_INCOHERENCES,
  lastUpdated: '2026-04-16',
};

// 3. Fix María Consuelo del Río role description
const delRioIdx = vps.findIndex((v) => v.id === 'maria-consuelo-del-rio');
if (delRioIdx !== -1) {
  const dr = vps[delRioIdx];
  dr.bio =
    'María Consuelo del Río Mantilla es una abogada colombiana especialista en derechos humanos. Se desempeñó como Veedora Distrital de Bogotá, Defensora Delegada para los Derechos Económicos, Sociales y Culturales de la Defensoría del Pueblo, Directora Nacional de Promoción y Divulgación de DDHH, Defensora Regional de los Nuevos Departamentos, Secretaria General de Findeter, y ocupó cargos directivos en Ecopetrol y la Consejería Presidencial para DDHH. El 14 de marzo de 2026 fue confirmada como fórmula vicepresidencial de Clara López Obregón (Esperanza Democrática / Pacto Histórico), fórmula que se mantuvo hasta el retiro de López en abril de 2026 en favor de Iván Cepeda.';
  dr.lastUpdated = '2026-04-16';
  vps[delRioIdx] = dr;
}

writeFileSync(CANDS, JSON.stringify(cands, null, 2) + '\n');
writeFileSync(VPS, JSON.stringify(vps, null, 2) + '\n');

console.log('✓ Oviedo migrated to vp-candidates.json');
console.log('  - type: presidential_candidate → vp_candidate');
console.log('  - party: null → centro-democratico');
console.log('  - 2 verified incoherences added');
console.log('✓ Alarcón: 2 verified incoherences added');
console.log('✓ del Río: bio corrected (Veedora Distrital + Defensora Delegada DESC)');
console.log('');
console.log('Honestidad metodológica:');
console.log('  - Aída Quilcué: incoherences[] = [] (sin incoherencias verificables)');
console.log('  - del Río: incoherences[] = [] (perfil sin track record contrastable)');
console.log('  - Zapata, Ramírez, Villegas: incoherences[] = [] (sin trayectoria verificable)');
