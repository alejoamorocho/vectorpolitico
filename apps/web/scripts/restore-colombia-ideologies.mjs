#!/usr/bin/env node
/**
 * restore-colombia-ideologies.mjs
 *
 * Reemplaza 6 celdas actuales por ideologías que SÍ aplican a Colombia,
 * manteniendo el grid uniforme de 8×14. Conserva posición, tamaño, cuadrante
 * y color de la celda original; solo cambia id, name, description y contenido.
 *
 * Sustituciones:
 *   esoteric-fascism       → fascism
 *   colonialism            → authoritarian-capitalism
 *   neoclassical-liberalism → liberal-corporatism
 *   capitalist-transhumanism → transhumanism
 *   hoppeanism             → minarchism
 *   anarcho-frontierism    → individualist-anarchism
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(__dirname, '../../../packages/data/ideologies.json');

const REPLACEMENTS = {
  'esoteric-fascism': {
    id: 'fascism',
    name: 'Fascismo',
    nameEn: 'Fascism',
    description:
      'Ideología autoritaria de derecha que fusiona ultranacionalismo, corporativismo económico, culto al líder, militarismo y supresión de la disidencia. Combina conservadurismo cultural extremo con movilización de masas controlada por el Estado.',
    longDescription:
      'El fascismo es una ideología política autoritaria, ultranacionalista y corporativista surgida en la Italia de Mussolini (1919-1945). Rechaza el liberalismo democrático y el socialismo marxista a favor de un Estado total que subordina al individuo, al mercado y a la sociedad civil a los objetivos de una nación idealizada. Combina elementos de derecha (jerarquía, tradición, propiedad privada mediada por el Estado) con movilización popular vertical, culto al líder y represión sistemática de la disidencia. En Colombia ha sido objeto de debate académico al analizar expresiones de ultraderecha con elementos corporativistas, militaristas y xenófobos dentro del espectro político contemporáneo.',
    historicalContext:
      'Nace en la Italia de entreguerras (1919-1922) con Benito Mussolini y se extiende a Alemania (nazismo), España (falangismo), Portugal (Estado Novo) y Rumania. Tras la derrota del Eje en 1945, muta en el neofascismo, que abandona el racismo biológico explícito pero conserva el ultranacionalismo, el corporativismo y la hostilidad al pluralismo. En América Latina ha influido en movimientos nacionalistas y en análisis académicos sobre ultraderecha contemporánea.',
    keyThinkers: ['Benito Mussolini', 'Giovanni Gentile', 'Julius Evola', 'Carl Schmitt'],
    historicalExamples: [
      'Italia fascista (1922-1943)',
      'Falange Española (1933-presente, marginal)',
      'Estado Novo portugués (1933-1974)',
    ],
    relatedIdeologies: ['nazism', 'neo-fascism', 'nationalist-conservatism', 'authoritarian-capitalism'],
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Fascismo',
    externalLinks: [
      {
        title: 'Fascismo — Enciclopedia Británica',
        url: 'https://www.britannica.com/topic/fascism',
        outlet: 'Britannica',
      },
      {
        title: 'Roger Griffin — The Nature of Fascism',
        url: 'https://www.routledge.com/The-Nature-of-Fascism/Griffin/p/book/9780415096614',
        outlet: 'Routledge',
      },
    ],
  },
  colonialism: {
    id: 'authoritarian-capitalism',
    name: 'Capitalismo Autoritario',
    nameEn: 'Authoritarian Capitalism',
    description:
      'Sistema que combina economía de mercado y propiedad privada con un Estado políticamente autoritario que restringe libertades civiles, controla la prensa y limita la oposición democrática.',
    longDescription:
      'El capitalismo autoritario combina la economía de mercado y la protección de la propiedad privada con un Estado políticamente autoritario que restringe libertades civiles, controla la prensa, coopta el poder judicial y limita la competencia democrática. Puede presentarse con formas electorales acotadas, pero concentra el poder ejecutivo y debilita los contrapesos institucionales. En América Latina se asocia a experiencias como el Chile de Pinochet (1973-1990) y a sectores contemporáneos que postulan mano dura en materia de seguridad y concentración del poder presidencial junto a liberalización económica.',
    historicalContext:
      'Teorizado por Lee Kuan Yew en Singapur y Carl Schmitt en Alemania. En América Latina se asocia con las dictaduras militares de Chile (Pinochet) y con gobiernos contemporáneos que combinan liberalización económica y restricción democrática. En Colombia es una categoría usada para analizar corrientes uribistas con componentes autoritarios en seguridad y concentración presidencial.',
    keyThinkers: ['Lee Kuan Yew', 'Carl Schmitt', 'Augusto Pinochet'],
    historicalExamples: [
      'Chile bajo Pinochet (1973-1990)',
      'Singapur bajo el PAP',
      'China post-1978 (modelo de partido único + mercado)',
    ],
    relatedIdeologies: ['pinochetism', 'nationalist-conservatism', 'neo-conservatism', 'fascism'],
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Capitalismo_autoritario',
    externalLinks: [
      {
        title: 'Authoritarian Capitalism — Journal of Democracy',
        url: 'https://www.journalofdemocracy.org',
        outlet: 'Journal of Democracy',
      },
    ],
  },
  'neoclassical-liberalism': {
    id: 'liberal-corporatism',
    name: 'Corporativismo Liberal',
    nameEn: 'Liberal Corporatism',
    description:
      'Sistema que integra grandes actores económicos (gremios empresariales, sindicatos) en la formulación de política pública bajo un marco de mercado liberal. Privilegia el diálogo tripartito Estado-empresa-trabajadores con preponderancia del sector privado.',
    longDescription:
      'El corporativismo liberal es un enfoque de política pública donde grandes actores económicos organizados — gremios empresariales, federaciones industriales y, en menor medida, sindicatos — participan institucionalmente en la formulación de políticas dentro de un marco de mercado liberal. A diferencia del corporativismo fascista, es voluntario, pluralista y compatible con la democracia representativa. En Colombia es un patrón visible en la influencia de gremios como la ANDI, FENALCO, ANALDEX y ASOBANCARIA en consejos técnicos del Gobierno, Comisiones de Concertación y mesas tripartitas.',
    historicalContext:
      'Raíces en el corporativismo católico del siglo XIX y las democracias consociacionales europeas de posguerra (Austria, Países Bajos, Suecia). En Colombia se institucionalizó con la Comisión de Concertación de Políticas Salariales y Laborales (1991) y la participación gremial en el CONPES.',
    keyThinkers: ['Philippe Schmitter', 'Gerhard Lehmbruch'],
    historicalExamples: [
      'Comisión de Concertación Laboral en Colombia (1991-presente)',
      'Democracia consociacional austriaca post-1945',
      'Modelo escandinavo de concertación',
    ],
    relatedIdeologies: ['third-way', 'social-liberalism', 'liberal-conservatism'],
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Corporativismo',
    externalLinks: [
      {
        title: 'Schmitter — Still the Century of Corporatism?',
        url: 'https://www.jstor.org/stable/1406378',
        outlet: 'JSTOR',
      },
    ],
  },
  'capitalist-transhumanism': {
    id: 'transhumanism',
    name: 'Transhumanismo',
    nameEn: 'Transhumanism',
    description:
      'Corriente filosófica y política que propone superar las limitaciones biológicas, cognitivas y de expectativa de vida humanas mediante tecnología: ingeniería genética, inteligencia artificial, neurociencia y biotecnología.',
    longDescription:
      'El transhumanismo sostiene que la especie humana puede y debe superar sus limitaciones biológicas, cognitivas y de salud mediante el uso de tecnologías emergentes: ingeniería genética, inteligencia artificial, interfaces cerebro-computador, biotecnología y extensión radical de la vida. Políticamente abarca desde variantes libertarias (transhumanismo de mercado) hasta propuestas progresistas de acceso universal a mejoras cognitivas. En Colombia tiene expresiones minoritarias en debates sobre ética biomédica, regulación de IA y derechos digitales dentro de sectores académicos y de la sociedad civil.',
    historicalContext:
      'Término acuñado por Julian Huxley (1957). Consolidado con la Declaración Transhumanista (1998) y la World Transhumanist Association (actual Humanity+). Desde 2010 ha permeado el debate público global sobre IA, edición genética (CRISPR) y extensión de la vida.',
    keyThinkers: ['Julian Huxley', 'Nick Bostrom', 'Ray Kurzweil', 'Max More'],
    historicalExamples: [
      'Humanity+ (1998-presente)',
      'Movimiento Extropiano (1988-2006)',
      'Debates sobre CRISPR (2012-presente)',
    ],
    relatedIdeologies: ['eco-transhumanism', 'technocracy', 'techno-libertarianism'],
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Transhumanismo',
    externalLinks: [
      {
        title: 'Humanity+ — Transhumanist Declaration',
        url: 'https://humanityplus.org/philosophy/transhumanist-declaration/',
        outlet: 'Humanity+',
      },
      {
        title: 'Nick Bostrom — Transhumanist FAQ',
        url: 'https://www.nickbostrom.com/views/transhumanist.pdf',
        outlet: 'Nick Bostrom',
      },
    ],
  },
  hoppeanism: {
    id: 'minarchism',
    name: 'Minarquismo',
    nameEn: 'Minarchism',
    description:
      'Corriente libertaria que defiende un Estado mínimo limitado a funciones de policía, justicia y defensa. Reduce radicalmente impuestos, regulación y rol social del Estado, confiando en el mercado como mecanismo central de coordinación.',
    longDescription:
      'El minarquismo es una corriente del libertarianismo que defiende la existencia de un Estado mínimo — también llamado "Estado vigilante nocturno" — limitado exclusivamente a las funciones de protección frente a la fuerza (policía, sistema judicial y defensa nacional). Todos los demás bienes y servicios, incluyendo educación, salud e infraestructura, son provistos por el mercado o por asociaciones voluntarias. En Colombia, sectores de la derecha liberal con discurso anti-impuesto y anti-regulación expresan posiciones próximas al minarquismo sin adoptar la etiqueta formalmente.',
    historicalContext:
      'Formulado en el siglo XX por Robert Nozick ("Anarchy, State, and Utopia", 1974) como respuesta libertaria a Rawls. Influyente en la derecha libertaria estadounidense y en los círculos Mises y Cato. En Colombia ha permeado sectores de think tanks liberales y campañas con discurso contra el "estatismo".',
    keyThinkers: ['Robert Nozick', 'Ayn Rand', 'Murray Rothbard (etapa minarquista)'],
    historicalExamples: [
      'Programa del Partido Libertario de EE.UU.',
      'Think tanks como el Instituto Cato',
      'Campañas colombianas con discurso anti-impuesto (ILN, sectores de Creemos)',
    ],
    relatedIdeologies: ['libertarianism', 'classical-liberalism', 'objectivism', 'anarcho-capitalism'],
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Minarquismo',
    externalLinks: [
      {
        title: 'Nozick — Anarchy, State, and Utopia',
        url: 'https://www.basicbooks.com/titles/robert-nozick/anarchy-state-and-utopia/9780465097203/',
        outlet: 'Basic Books',
      },
    ],
  },
  'anarcho-frontierism': {
    id: 'individualist-anarchism',
    name: 'Anarquismo Individualista',
    nameEn: 'Individualist Anarchism',
    description:
      'Corriente anarquista que enfatiza la autonomía absoluta del individuo frente a toda autoridad coercitiva — Estado, religión o colectividad. Rechaza el socialismo colectivista y defiende propiedad individual, asociación voluntaria y libre intercambio.',
    longDescription:
      'El anarquismo individualista defiende la autonomía soberana del individuo frente a cualquier forma de autoridad coercitiva, incluido el Estado, la religión organizada y la colectividad obligatoria. Rechaza tanto el capitalismo corporativo como el socialismo colectivista, promoviendo asociaciones voluntarias, propiedad basada en ocupación/uso y mercados libres entre individuos iguales. Influyó en la tradición libertaria norteamericana y latinoamericana. En Colombia tiene expresiones minoritarias en movimientos autónomos, cooperativas de librepensadores y sectores académicos críticos del Estado.',
    historicalContext:
      'Nace en el siglo XIX con Max Stirner, Josiah Warren y Benjamin Tucker en EE.UU., y en Europa con Pierre-Joseph Proudhon. Se distingue del anarco-comunismo al rechazar la propiedad común y de los anarco-capitalismos modernos al rechazar el capitalismo corporativo. En Colombia tiene presencia minoritaria en círculos contraculturales y académicos.',
    keyThinkers: ['Max Stirner', 'Josiah Warren', 'Benjamin Tucker', 'Lysander Spooner'],
    historicalExamples: [
      'Sociedad Comunitaria de Utopia (Warren, 1847)',
      'Publicación Liberty de Benjamin Tucker (1881-1908)',
      'Contracultura libertaria estadounidense del siglo XX',
    ],
    relatedIdeologies: ['libertarianism', 'egoism', 'voluntaryism', 'anarcho-capitalism'],
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Anarquismo_individualista',
    externalLinks: [
      {
        title: 'Individualist Anarchism — Stanford Encyclopedia of Philosophy',
        url: 'https://plato.stanford.edu/entries/anarchism/',
        outlet: 'Stanford',
      },
    ],
  },
};

const data = JSON.parse(readFileSync(INPUT, 'utf-8'));

let replaced = 0;
const result = data.map((ide) => {
  const repl = REPLACEMENTS[ide.id];
  if (!repl) return ide;
  replaced++;
  // Keep geometry (x, y, width, height, quadrant, color) from the original cell
  return {
    id: repl.id,
    name: repl.name,
    nameEn: repl.nameEn,
    x: ide.x,
    y: ide.y,
    width: ide.width,
    height: ide.height,
    quadrant: ide.quadrant,
    color: ide.color,
    description: repl.description,
    wikipediaUrl: repl.wikipediaUrl,
    longDescription: repl.longDescription,
    historicalContext: repl.historicalContext,
    keyThinkers: repl.keyThinkers,
    historicalExamples: repl.historicalExamples,
    relatedIdeologies: repl.relatedIdeologies,
    externalLinks: repl.externalLinks,
  };
});

writeFileSync(INPUT, JSON.stringify(result, null, 2) + '\n', 'utf-8');

console.log(`✓ Restored ${replaced} Colombia-relevant ideologies.`);
console.log(`  Total cells: ${result.length} (uniform 8×14 grid preserved)`);
Object.entries(REPLACEMENTS).forEach(([from, to]) => {
  console.log(`  ${from} → ${to.id} (${to.name})`);
});
