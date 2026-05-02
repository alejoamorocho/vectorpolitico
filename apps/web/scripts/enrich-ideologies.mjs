#!/usr/bin/env node
/**
 * enrich-ideologies.mjs
 *
 * Enriquece el contenido (longDescription, historicalContext, keyThinkers,
 * historicalExamples, relatedIdeologies, externalLinks) de las ideologías
 * más referenciadas en el contexto político colombiano.
 *
 * Preserva geometría (x, y, width, height, quadrant, color) y metadata
 * estructural. Solo reescribe los campos narrativos.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(__dirname, '../../../packages/data/ideologies.json');

const ENRICHED = {
  progressivism: {
    longDescription:
      'El progresismo es una corriente política que apuesta por la reforma gradual de las instituciones para ampliar derechos civiles y sociales, corregir desigualdades estructurales y modernizar el Estado a la luz de los avances científicos. Combina elementos del liberalismo social, la socialdemocracia, el ambientalismo y el feminismo en una agenda reformista no revolucionaria.\n\nEn Colombia, el progresismo ha sido la bandera de Gustavo Petro y su coalición (Colombia Humana primero, luego Pacto Histórico desde 2021), y también atraviesa a figuras del Polo Democrático, Alianza Verde, Colombia Renaciente y sectores reformistas del liberalismo. La agenda progresista colombiana se articula alrededor de tres ejes: (1) reforma del modelo económico extractivo hacia transición energética; (2) profundización de derechos sociales (salud, educación, pensiones universales); (3) implementación plena del Acuerdo de Paz y justicia transicional.\n\nLa principal tensión interna del progresismo colombiano es entre su ala transformadora (partidaria de cambios estructurales acelerados) y su ala reformista (que prefiere cambios graduales dentro del marco institucional existente).',
    historicalContext:
      'El término "progresismo" nace en la Era Progresista estadounidense (1890-1920), con Theodore Roosevelt, Woodrow Wilson, Jane Addams y el movimiento Muckraker. En América Latina reapareció a finales del siglo XX como categoría distinta al socialismo marxista, para nombrar gobiernos de centro-izquierda democráticos: Lula en Brasil, Tabaré Vázquez y Mujica en Uruguay, Bachelet en Chile, Correa en Ecuador, Kirchner y Fernández en Argentina. En Colombia se asoció primero con sectores del liberalismo (Luis Carlos Galán, Horacio Serpa) y desde 2010 con la Colombia Humana de Gustavo Petro, que accedió al poder en 2022.',
    keyThinkers: [
      'John Dewey',
      'Jane Addams',
      'Theodore Roosevelt',
      'Lester Frank Ward',
      'John Rawls',
    ],
    historicalExamples: [
      'Era Progresista estadounidense (1890-1920)',
      'New Deal de Franklin D. Roosevelt (1933-1939)',
      'Gobierno de Michelle Bachelet en Chile (2006-2010, 2014-2018)',
      'Gobierno de Lula da Silva en Brasil (2003-2010, 2023-)',
      'Gobierno de Gustavo Petro en Colombia (2022-)',
    ],
    relatedIdeologies: [
      'social-liberalism',
      'social-democracy',
      'green-politics',
      'democratic-socialism',
      'third-way',
    ],
    externalLinks: [
      { title: 'Progressivism — Stanford Encyclopedia', url: 'https://plato.stanford.edu/entries/pragmatism/', outlet: 'Stanford' },
      { title: 'El progresismo latinoamericano del siglo XXI', url: 'https://nuso.org/articulo/el-progresismo-latinoamericano/', outlet: 'Nueva Sociedad' },
      { title: 'Petro y el progresismo colombiano', url: 'https://razonpublica.com', outlet: 'Razón Pública' },
    ],
  },

  'social-liberalism': {
    longDescription:
      'El liberalismo social sostiene que el Estado debe garantizar condiciones materiales mínimas (educación, salud, seguridad social) para que la libertad individual sea efectiva y no una mera formalidad. Acepta la economía de mercado pero considera legítimo regularla y redistribuir mediante impuestos progresivos y gasto social focalizado. En el eje de derechos civiles es fuertemente pluralista: defiende libertades individuales, diversidad sexual y libertad religiosa.\n\nEn Colombia es la matriz ideológica de buena parte del Partido Liberal histórico (Lleras Restrepo, Galán, Serpa), del Nuevo Liberalismo, de sectores de Alianza Verde y de movimientos como En Marcha, Colombia Renaciente y Dignidad-Compromiso. Se distingue de la socialdemocracia en que mantiene mayor confianza en el mercado y menor peso al sindicalismo; y del liberalismo clásico en que rechaza el laissez-faire y acepta un Estado social fuerte.\n\nSu principal tensión contemporánea es cómo sostener un Estado social robusto con una base fiscal estrecha y una economía informal alta, problemas estructurales del caso colombiano.',
    historicalContext:
      'Formulado por T.H. Green, L.T. Hobhouse y John Hobson en Gran Bretaña a finales del siglo XIX como respuesta a la miseria industrial. Influyó en el New Deal de FDR, en el Estado de Bienestar británico de la posguerra y en el liberalismo continental europeo. En Colombia llegó con Alfonso López Pumarejo y la "Revolución en Marcha" (1934-1938), cristalizándose luego en el Partido Liberal reformista y en el pensamiento galanista.',
    keyThinkers: [
      'John Stuart Mill',
      'L.T. Hobhouse',
      'John Maynard Keynes',
      'John Rawls',
      'Amartya Sen',
    ],
    historicalExamples: [
      'New Deal estadounidense (1933-1939)',
      'Estado de bienestar británico de posguerra',
      'Revolución en Marcha (Colombia, 1934-1938)',
      'Gobierno de Luis Carlos Galán como movimiento (1979-1989)',
    ],
    relatedIdeologies: ['progressivism', 'social-democracy', 'liberal-democracy', 'third-way'],
    externalLinks: [
      { title: 'Social Liberalism — Encyclopedia Britannica', url: 'https://www.britannica.com/topic/social-liberalism', outlet: 'Britannica' },
      { title: 'Rawls — A Theory of Justice', url: 'https://www.hup.harvard.edu/books/9780674017726', outlet: 'Harvard' },
    ],
  },

  'democratic-socialism': {
    longDescription:
      'El socialismo democrático propone transformar el capitalismo mediante reformas estructurales profundas — socialización de sectores estratégicos, fortalecimiento de empresas públicas, democracia económica, fuerte redistribución — dentro del marco de la democracia liberal y sin abolir por completo la propiedad privada ni el mercado. Se diferencia del comunismo por su compromiso con el pluralismo político y las elecciones libres, y de la socialdemocracia tradicional por su aspiración a cambios estructurales y no solo redistributivos.\n\nEn Colombia, esta corriente ha sido representada históricamente por el Polo Democrático Alternativo, la Unión Patriótica (UP, diezmada por el genocidio político de los años 80-90), Comunes (ex-FARC), y actualmente por sectores del Pacto Histórico. Sus propuestas típicas incluyen: reforma tributaria progresiva, nacionalización parcial de sectores estratégicos (energía, salud, pensiones), reforma agraria redistributiva y democratización económica.\n\nSu tensión interna recurrente es entre la facción transformadora (partidaria de cambios acelerados) y la reformista (que privilegia pactos dentro del marco institucional).',
    historicalContext:
      'Sus raíces están en la socialdemocracia europea del siglo XIX (Bernstein, Kautsky), en el laborismo británico (Bevin, Attlee) y en el austromarxismo (Otto Bauer). En América Latina se consolida con la experiencia chilena de la Unidad Popular de Allende (1970-1973), la Revolución de los Claveles (Portugal 1974) y más recientemente en figuras como Bernie Sanders en EE.UU. y Boric en Chile. En Colombia ha estado ligado a la izquierda democrática desde la Unión Patriótica hasta el actual Pacto Histórico.',
    keyThinkers: [
      'Eduard Bernstein',
      'Rosa Luxemburg',
      'Karl Kautsky',
      'Clement Attlee',
      'Bernie Sanders',
      'Salvador Allende',
    ],
    historicalExamples: [
      'Gobierno de Salvador Allende en Chile (1970-1973)',
      'Laborismo británico bajo Attlee (1945-1951)',
      'Gobierno de Gabriel Boric en Chile (2022-)',
      'Unión Patriótica en Colombia (1985-2002)',
    ],
    relatedIdeologies: ['social-democracy', 'progressivism', 'left-populism', 'eco-socialism'],
    externalLinks: [
      { title: 'Democratic Socialism — Stanford Encyclopedia', url: 'https://plato.stanford.edu/entries/socialism/', outlet: 'Stanford' },
      { title: 'Unión Patriótica: memoria y justicia', url: 'https://www.centrodememoriahistorica.gov.co', outlet: 'CNMH' },
    ],
  },

  'fiscal-conservatism': {
    longDescription:
      'El conservadurismo fiscal prioriza la disciplina presupuestal, el equilibrio fiscal, la deuda baja y la eficiencia del gasto público. Sostiene que el Estado debe vivir dentro de sus posibilidades, evitar el déficit crónico y preservar la estabilidad macroeconómica como condición de crecimiento. Es agnóstico o flexible en agenda social, pero inflexible en política económica: impuestos moderados, gasto focalizado, recorte de subsidios universales, evitar expansiones fiscales no financiadas.\n\nEn Colombia es la doctrina dominante del Ministerio de Hacienda desde finales del siglo XX (regla fiscal, marco fiscal de mediano plazo) y la bandera de figuras como Juan Carlos Echeverry, Alberto Carrasquilla, José Antonio Ocampo (en su versión socialdemócrata) y los gremios empresariales (ANDI, FENALCO). Cruza transversalmente a partidos: hay conservadores fiscales en el Liberal, Cambio Radical, Centro Democrático, La U y Partido Conservador.\n\nSu tensión central es con la agenda social expansiva: demanda cuentas claras pero puede ser percibido como insensible ante emergencias sociales o déficits de inversión pública histórica.',
    historicalContext:
      'Se formaliza en Inglaterra victoriana con Gladstone y la doctrina del "sound money". Resurge globalmente con Margaret Thatcher y Ronald Reagan (1979-1989) bajo el nombre de "austeridad" y se institucionaliza en América Latina tras las crisis de deuda de los años 80, con el Consenso de Washington (1989) y las reformas estructurales. En Colombia se consolida con la Ley 617 de 2000, la Regla Fiscal de 2011 y el Marco Fiscal de Mediano Plazo.',
    keyThinkers: [
      'William Gladstone',
      'Milton Friedman',
      'F.A. Hayek',
      'Jean-Claude Trichet',
      'Rudi Dornbusch',
    ],
    historicalExamples: [
      'Thatcherismo británico (1979-1990)',
      'Reaganomics en EE.UU. (1981-1989)',
      'Regla Fiscal colombiana (Ley 1473 de 2011)',
      'Consenso de Washington (1989)',
    ],
    relatedIdeologies: [
      'classical-liberalism',
      'liberal-conservatism',
      'neo-liberalism',
      'minarchism',
    ],
    externalLinks: [
      { title: 'Fiscal Conservatism — Britannica', url: 'https://www.britannica.com/topic/fiscal-conservatism', outlet: 'Britannica' },
      { title: 'Regla Fiscal Colombia — Minhacienda', url: 'https://www.minhacienda.gov.co', outlet: 'MinHacienda' },
    ],
  },

  'liberal-conservatism': {
    longDescription:
      'El conservadurismo liberal combina la defensa del libre mercado y la economía abierta con una posición conservadora en lo social y lo institucional: respeto por la tradición, la familia, el orden público y las jerarquías institucionales. Acepta el Estado de derecho constitucional y la democracia liberal, pero rechaza las reformas estructurales aceleradas y prefiere el cambio gradual.\n\nEn Colombia es la matriz ideológica histórica de buena parte del Partido Conservador (desde Ospina Pérez hasta Andrés Pastrana), del Centro Democrático (Uribe, Cabal, Miguel Uribe), de Cambio Radical (Vargas Lleras), La U y la Liga de Gobernantes Anticorrupción. En su versión colombiana tiene un énfasis marcado en seguridad ciudadana, anti-populismo y defensa del modelo económico de apertura.\n\nSu tensión contemporánea es con las demandas sociales del siglo XXI: derechos LGBTIQ+, aborto, drogas, diversidad religiosa — agendas en las que la base conservadora tradicional choca con las libertades del individuo que el liberalismo defiende.',
    historicalContext:
      'Formulado en Inglaterra por Edmund Burke como respuesta moderada a la Revolución Francesa: defensa del orden, de las instituciones heredadas y del libre mercado contra el radicalismo jacobino. En el siglo XX toma forma en el Partido Conservador británico (Churchill, Thatcher, Cameron), el CDU alemán (Adenauer, Kohl, Merkel) y el GOP estadounidense pre-Trump. En Colombia es la línea dominante del Partido Conservador y del uribismo moderado.',
    keyThinkers: [
      'Edmund Burke',
      'Friedrich Hayek',
      'Roger Scruton',
      'Álvaro Gómez Hurtado',
    ],
    historicalExamples: [
      'Partido Conservador británico (siglo XX)',
      'CDU alemán bajo Merkel (2005-2021)',
      'Centro Democrático colombiano (2013-)',
      'Gobierno de Álvaro Uribe (2002-2010)',
    ],
    relatedIdeologies: [
      'fiscal-conservatism',
      'nationalist-conservatism',
      'classical-liberalism',
      'neo-conservatism',
    ],
    externalLinks: [
      { title: 'Burke — Reflections on the Revolution in France', url: 'https://oll.libertyfund.org/title/burke-reflections-on-the-revolution-in-france', outlet: 'Liberty Fund' },
      { title: 'Conservadurismo liberal en Colombia', url: 'https://razonpublica.com', outlet: 'Razón Pública' },
    ],
  },

  'nationalist-conservatism': {
    longDescription:
      'El conservadurismo nacionalista subordina la economía y las libertades individuales a la defensa de la identidad nacional, la soberanía y la cohesión cultural del Estado-nación. En el eje económico tiende a la derecha (libre mercado con proteccionismo selectivo), pero se aleja del liberalismo en su énfasis en el Estado fuerte, la seguridad dura y los valores culturales tradicionales. Suele ser escéptico de la integración supranacional, del multilateralismo y de la migración.\n\nEn Colombia es la corriente ideológica del uribismo duro: Centro Democrático bajo Álvaro Uribe, María Fernanda Cabal, Miguel Uribe, Paloma Valencia, Abelardo de la Espriella. Su discurso combina defensa irrestricta de las Fuerzas Armadas, rechazo a la Jurisdicción Especial para la Paz (JEP), oposición a reformas de tierras y salud, y defensa de valores conservadores (familia tradicional, religión cristiana, oposición al aborto y a derechos LGBTIQ+).\n\nSu tensión con el liberalismo clásico es visible: comparte la agenda económica pero se distancia en libertades individuales. Con el neoconservadurismo comparte la defensa del orden pero lo matiza con una carga mayor de patriotismo y particularismo cultural.',
    historicalContext:
      'Raíces en el nacionalismo decimonónico europeo (Maurras, Barrès) y en el republicanismo conservador estadounidense del siglo XX. Resurge globalmente en el siglo XXI con líderes como Viktor Orbán (Hungría), Jarosław Kaczyński (Polonia), Donald Trump (EE.UU.), Giorgia Meloni (Italia) y Jair Bolsonaro (Brasil). En Colombia tiene antecedentes en el conservadurismo laureanista (1946-1953) y se consolida contemporáneamente con la irrupción del uribismo (2002-).',
    keyThinkers: [
      'Edmund Burke',
      'Charles Maurras',
      'Patrick Deneen',
      'Yoram Hazony',
      'Laureano Gómez',
    ],
    historicalExamples: [
      'Gobierno de Viktor Orbán en Hungría (desde 2010)',
      'Trumpismo estadounidense (2016-)',
      'Uribismo colombiano (2002-)',
      'Bolsonarismo brasileño (2018-2022)',
    ],
    relatedIdeologies: [
      'liberal-conservatism',
      'neo-conservatism',
      'paleo-conservatism',
      'traditionalist-conservatism',
      'authoritarian-capitalism',
    ],
    externalLinks: [
      { title: 'Yoram Hazony — The Virtue of Nationalism', url: 'https://www.basicbooks.com/titles/yoram-hazony/the-virtue-of-nationalism/9781541645370/', outlet: 'Basic Books' },
      { title: 'Uribismo: ideología y política', url: 'https://razonpublica.com', outlet: 'Razón Pública' },
    ],
  },

  'social-democracy': {
    longDescription:
      'La socialdemocracia es una corriente política que acepta el capitalismo regulado pero busca humanizarlo mediante un fuerte Estado de bienestar, derechos laborales robustos, universalización de servicios públicos (salud, educación, pensiones) y una tributación progresiva que sostenga la redistribución. Se distingue del socialismo revolucionario al trabajar dentro del marco democrático liberal, y del liberalismo social al dar mayor peso al sindicalismo y a los pactos tripartitos Estado-empresa-trabajadores.\n\nEn Colombia es la matriz del Partido Liberal histórico (Lleras Restrepo, López Michelsen, Serpa), del galanismo, de sectores del Pacto Histórico, del Polo Democrático moderado y de movimientos como Dignidad-Compromiso (Robledo, Lozano). Sus propuestas típicas incluyen: reforma laboral pro-sindicato, universalización de salud y pensiones, reforma tributaria progresiva, ampliación de derechos sociales y política industrial activa.\n\nSu principal desafío en el caso colombiano es la estructura fiscal: la informalidad laboral >50% y el bajo recaudo tributario dificultan financiar un Estado de bienestar clásico europeo.',
    historicalContext:
      'Surge a finales del siglo XIX como división del socialismo marxista (Bernstein, Kautsky). Se consolida en la posguerra europea: laborismo británico (Attlee), SPD alemán (Brandt, Schmidt), socialistas franceses (Blum, Mitterrand) y socialdemocracia nórdica (Palme en Suecia, Bratteli en Noruega). En América Latina se asoció con Acción Democrática en Venezuela, el PRI mexicano (en ciertas fases) y sectores del liberalismo colombiano. Hoy está representada por líderes como Pedro Sánchez (España), Olaf Scholz (Alemania) y Gabriel Boric (Chile, con matices).',
    keyThinkers: [
      'Eduard Bernstein',
      'Olof Palme',
      'Willy Brandt',
      'Bruno Kreisky',
      'Tony Crosland',
      'Alfonso López Pumarejo',
    ],
    historicalExamples: [
      'Suecia bajo Olof Palme (1969-1986)',
      'Alemania Federal bajo SPD (Brandt, Schmidt)',
      'Costa Rica bajo Liberación Nacional',
      'Revolución en Marcha (Colombia, 1934-1938)',
    ],
    relatedIdeologies: ['democratic-socialism', 'progressivism', 'social-liberalism', 'third-way'],
    externalLinks: [
      { title: 'Social Democracy — Encyclopedia Britannica', url: 'https://www.britannica.com/topic/social-democracy', outlet: 'Britannica' },
      { title: 'Socialdemocracia y reformismo en América Latina', url: 'https://nuso.org', outlet: 'Nueva Sociedad' },
    ],
  },

  'green-politics': {
    longDescription:
      'La política verde (Greenismo) pone la crisis ecológica en el centro del análisis político y propone una transformación del modelo económico hacia la sostenibilidad: transición energética justa, protección de ecosistemas, economía circular y reconocimiento de los derechos de la naturaleza. En su versión latinoamericana integra fuertemente la defensa de territorios indígenas y afrodescendientes, la lucha contra el extractivismo y la justicia climática.\n\nEn Colombia es la bandera del partido Alianza Verde (con figuras como Angélica Lozano, Claudia López, Antanas Mockus, Jorge Londoño), de Verde Oxígeno (Íngrid Betancourt), del Partido Ecologista, de Colombia Humana ambiental y de movimientos territoriales que se oponen al fracking, la minería a cielo abierto y la deforestación.\n\nSu tensión interna es entre dos almas: (1) una verde-liberal, pragmática y de mercado (economía circular, incentivos a energías renovables), y (2) una verde-transformadora que articula ecología con anticapitalismo, reforma agraria y derechos de comunidades étnicas.',
    historicalContext:
      'Nace en los años 70 en Alemania (Die Grünen, fundados en 1980 con figuras como Joschka Fischer y Petra Kelly), en Reino Unido (People Party) y en Australia. Se globaliza tras la Cumbre de la Tierra de Río 1992 y el Acuerdo de París 2015. En América Latina se articula con movimientos indígenas y campesinos (Chico Mendes en Brasil) y toma forma partidaria en Colombia con Alianza Verde (2005-2006).',
    keyThinkers: [
      'Rachel Carson',
      'Murray Bookchin',
      'Naomi Klein',
      'Berta Cáceres',
      'Francisca Piquero',
    ],
    historicalExamples: [
      'Die Grünen en Alemania (desde 1980)',
      'Movimiento Chipko en India',
      'Alianza Verde en Colombia (desde 2005)',
      'Gobierno de Antanas Mockus (Bogotá, 1995-1997, 2001-2003)',
    ],
    relatedIdeologies: [
      'eco-socialism',
      'environmentalism',
      'progressivism',
      'social-democracy',
      'eco-anarchism',
    ],
    externalLinks: [
      { title: 'Green Politics — Stanford Encyclopedia', url: 'https://plato.stanford.edu/entries/environmental-ethics/', outlet: 'Stanford' },
      { title: 'Naomi Klein — This Changes Everything', url: 'https://www.penguinrandomhouse.com/books/221977/this-changes-everything-by-naomi-klein/', outlet: 'Penguin' },
    ],
  },

  'third-way': {
    longDescription:
      'La Tercera Vía propone una síntesis centrista entre el Estado de bienestar socialdemócrata y la economía de mercado liberal, buscando eficiencia económica con cohesión social. Sus ejes son: (1) mantenimiento del gasto social pero con énfasis en eficiencia y focalización; (2) reforma del mercado laboral para flexibilizarlo sin perder derechos; (3) gobernanza pragmática basada en evidencia; (4) rechazo tanto del dogmatismo neoliberal como del intervencionismo excesivo.\n\nEn Colombia se expresa en figuras como Juan Daniel Oviedo, Sergio Fajardo, Alejandro Gaviria, Mauricio Lizcano, Juan Manuel Galán y en el Nuevo Liberalismo contemporáneo. Se caracteriza por el discurso de "ni izquierda ni derecha", el énfasis en la tecnocracia, la modernización institucional y la superación de la polarización.\n\nSu crítica más común es que diluye las posiciones políticas en un centro ambiguo que no resuelve conflictos estructurales (desigualdad, tierra, extractivismo). Sus defensores responden que logra gobernabilidad y resultados verificables sin polarización.',
    historicalContext:
      'Teorizada por Anthony Giddens en "The Third Way" (1998) y aplicada por Tony Blair (Nuevo Laborismo, 1994-2007), Bill Clinton (Nuevo Demócrata, 1992-2000), Gerhard Schröder (Agenda 2010, SPD alemán) y Felipe González en los años 90 tardíos. En América Latina tomó forma con figuras como Ricardo Lagos en Chile y sectores del PT brasileño bajo Lula. En Colombia se asocia con el fajardismo (Compromiso Ciudadano) y con discursos tecnocráticos recientes.',
    keyThinkers: [
      'Anthony Giddens',
      'Tony Blair',
      'Bill Clinton',
      'Felipe González',
      'Alejandro Gaviria',
    ],
    historicalExamples: [
      'Nuevo Laborismo de Tony Blair (1997-2007)',
      'Administración Clinton en EE.UU. (1993-2001)',
      'Gobierno de Ricardo Lagos en Chile (2000-2006)',
      'Fajardismo en Antioquia y Medellín (2004-)',
    ],
    relatedIdeologies: ['social-liberalism', 'social-democracy', 'liberal-conservatism', 'technocracy'],
    externalLinks: [
      { title: 'Giddens — The Third Way', url: 'https://www.polity.co.uk/book.asp?ref=9780745622675', outlet: 'Polity' },
      { title: 'Tercera Vía en América Latina', url: 'https://nuso.org', outlet: 'Nueva Sociedad' },
    ],
  },

  'neo-conservatism': {
    longDescription:
      'El neoconservadurismo combina política exterior intervencionista (promoción activa de valores democráticos occidentales, a veces mediante la fuerza), política interior conservadora en lo cultural y liberal en lo económico. Surgió entre intelectuales estadounidenses desencantados con la izquierda de los años 60-70. Se distingue del conservadurismo tradicional por su universalismo (exportar democracia) y del liberalismo clásico por su énfasis en valores comunitarios y orden moral.\n\nEn Colombia tiene presencia en sectores del Centro Democrático (Miguel Uribe, Paloma Valencia) y en el discurso anti-chavista, anti-Maduro y anti-FARC de la derecha. Se caracteriza por el alineamiento con la política exterior estadounidense, el rechazo frontal a la izquierda bolivariana (Venezuela, Cuba, Nicaragua) y la defensa de los tratados de libre comercio con EE.UU. y Occidente.\n\nSu tensión con el paleoconservadurismo es visible: los neoconservadores aceptan la globalización y el libre mercado internacional; los paleoconservadores prefieren un conservadurismo aislacionista, proteccionista y tradicionalista.',
    historicalContext:
      'Emerge en EE.UU. en los años 70 entre ex-izquierdistas (Irving Kristol, Norman Podhoretz, Daniel Bell) que criticaban los "excesos" de la contracultura y la Gran Sociedad. Se consolida con Reagan (1981-1989), Bush padre y alcanza su apogeo con Bush hijo y las intervenciones en Afganistán e Iraq (2001-2008). En Colombia permea el discurso de seguridad democrática de Uribe y del uribismo contemporáneo.',
    keyThinkers: [
      'Irving Kristol',
      'Leo Strauss',
      'Norman Podhoretz',
      'Francis Fukuyama (fase temprana)',
      'Paul Wolfowitz',
    ],
    historicalExamples: [
      'Administración Reagan (1981-1989)',
      'Administración Bush hijo (2001-2009)',
      'Guerras de Afganistán e Iraq (2001-2011)',
      'Política de Seguridad Democrática (Colombia, 2002-2010)',
    ],
    relatedIdeologies: [
      'liberal-conservatism',
      'nationalist-conservatism',
      'fiscal-conservatism',
      'paleo-conservatism',
    ],
    externalLinks: [
      { title: 'Neoconservatism — Stanford Encyclopedia', url: 'https://plato.stanford.edu/entries/conservatism/', outlet: 'Stanford' },
      { title: 'Francis Fukuyama — After Neoconservatism', url: 'https://www.nytimes.com/2006/02/19/magazine/after-neoconservatism.html', outlet: 'NYT' },
    ],
  },

  'classical-liberalism': {
    longDescription:
      'El liberalismo clásico defiende un Estado mínimo centrado en proteger derechos individuales (vida, libertad, propiedad), el libre mercado sin mayores regulaciones, el libre comercio internacional y la separación entre Iglesia y Estado. Confía en que los órdenes espontáneos del mercado y la sociedad civil resuelven mejor los problemas sociales que la planeación estatal. A diferencia del libertarismo radical, acepta ciertas funciones estatales: justicia, seguridad, defensa, a veces educación y salud básica.\n\nEn Colombia es la doctrina de sectores del liberalismo empresarial, de los think tanks derecha-liberales (Instituto Libertario, La Libertad Colombia, Libertank), de candidatos como Abelardo de la Espriella (en su auto-identificación), y de la tradición de Rafael Núñez (después de la Regeneración, en clave más conservadora). Contemporáneamente aparece en sectores de Cambio Radical, Creemos y del Centro Democrático en su vertiente más económica.\n\nSu tensión con el libertarismo contemporáneo es importante: los clásicos aceptan el Estado constitucional; los libertarios tienden a preferir el mínimo absoluto o incluso la anarquía de mercado.',
    historicalContext:
      'Fundado por John Locke (1632-1704), Adam Smith (1723-1790) y David Ricardo (1772-1823). Consolidado en el liberalismo inglés del siglo XIX (Cobden, Bright) y el Partido Liberal de Gladstone. En EE.UU. influyó en Jefferson, Madison y el constitucionalismo. En Colombia llegó con el liberalismo radical de 1863 (Constitución de Rionegro), aunque posteriormente fue desplazado por el liberalismo social.',
    keyThinkers: ['John Locke', 'Adam Smith', 'David Ricardo', 'Frédéric Bastiat', 'F.A. Hayek'],
    historicalExamples: [
      'Liberalismo Manchester en Gran Bretaña (siglo XIX)',
      'Constitución de Rionegro (Colombia, 1863)',
      'Primera era liberal colombiana (1849-1880)',
    ],
    relatedIdeologies: [
      'fiscal-conservatism',
      'liberal-conservatism',
      'libertarianism',
      'minarchism',
      'social-liberalism',
    ],
    externalLinks: [
      { title: 'Classical Liberalism — Stanford Encyclopedia', url: 'https://plato.stanford.edu/entries/liberalism/', outlet: 'Stanford' },
      { title: 'Adam Smith — Wealth of Nations', url: 'https://oll.libertyfund.org/title/smith-an-inquiry-into-the-nature-and-causes-of-the-wealth-of-nations', outlet: 'Liberty Fund' },
    ],
  },

  'christian-democracy': {
    longDescription:
      'La democracia cristiana deriva de la doctrina social católica (Rerum Novarum, 1891) y propone una "tercera vía" entre liberalismo capitalista y socialismo marxista: economía de mercado regulada, subsidiariedad (las decisiones se toman al nivel más cercano posible), bien común, solidaridad y defensa de la familia tradicional. En lo económico es moderada; en lo social es conservadora pero no reaccionaria; en lo institucional apuesta por la democracia pluralista y los pactos sociales.\n\nEn Colombia ha sido una matriz importante del Partido Conservador histórico (desde la época de Ospina Pérez), del Partido MIRA (en clave cristiana pluriconfesional), del Partido Colombia Justa Libres y de sectores del liberalismo social cristiano. Su discurso típico incluye defensa de la familia, subsidios focalizados a los más pobres, economía de mercado con rostro humano y papel activo de las iglesias en política pública.\n\nSu tensión con el neoconservadurismo y el nacionalismo es importante: la democracia cristiana es históricamente europeísta, multilateralista y pluralista, mientras que las otras corrientes pueden ser particularistas y excluyentes.',
    historicalContext:
      'Formulada en la encíclica Rerum Novarum de León XIII (1891) y desarrollada por Jacques Maritain y Emmanuel Mounier. Tras la Segunda Guerra Mundial domina la política europea: CDU alemán (Adenauer, Kohl, Merkel), Democrazia Cristiana italiana (De Gasperi), MRP francés. En América Latina se consolida con Eduardo Frei en Chile (1964-1970), Rafael Caldera en Venezuela, y en Colombia con sectores del Partido Conservador y del MIRA.',
    keyThinkers: ['León XIII', 'Jacques Maritain', 'Konrad Adenauer', 'Eduardo Frei Montalva', 'Álvaro Gómez Hurtado'],
    historicalExamples: [
      'CDU alemán bajo Adenauer (1949-1963)',
      'Gobierno de Eduardo Frei en Chile (1964-1970)',
      'Partido MIRA en Colombia (desde 2000)',
      'Democrazia Cristiana italiana (1945-1994)',
    ],
    relatedIdeologies: [
      'social-conservatism',
      'liberal-conservatism',
      'social-gospel',
      'traditionalist-conservatism',
    ],
    externalLinks: [
      { title: 'Rerum Novarum — Vaticano', url: 'https://www.vatican.va/content/leo-xiii/es/encyclicals/documents/hf_l-xiii_enc_15051891_rerum-novarum.html', outlet: 'Vaticano' },
      { title: 'Christian Democracy — Routledge', url: 'https://www.routledge.com', outlet: 'Routledge' },
    ],
  },

  'left-populism': {
    longDescription:
      'El populismo de izquierda construye un antagonismo político entre un "pueblo" popular y trabajador y una "élite" oligárquica corrupta. Articula demandas sociales dispersas (pobreza, desigualdad, corrupción, concentración de la tierra) bajo un liderazgo carismático que encarna la voluntad popular. Económicamente propone redistribución agresiva, nacionalización de sectores estratégicos y expansión del gasto social; socialmente puede ser progresista (en derechos civiles) o más tradicionalista según el contexto.\n\nEn Colombia es la matriz del discurso de Gustavo Petro (con matices, ya que también tiene elementos socialdemócratas y progresistas), del chavismo bolivariano en su vertiente colombiana, de sectores de la ANTHOC y la CUT, y de movimientos territoriales con liderazgos carismáticos. Su principal expresión electoral fue el triunfo de Petro en 2022, primera elección presidencial de la izquierda en Colombia.\n\nSu tensión con la socialdemocracia y el socialismo democrático es relevante: el populismo depende más del liderazgo y de la movilización directa; las corrientes más institucionales apuestan por organizaciones partidarias robustas y pactos plurales.',
    historicalContext:
      'Teorizado por Ernesto Laclau y Chantal Mouffe como lógica política más que ideología. En América Latina toma forma con el peronismo argentino (Perón, 1946-1955, 1973-1974), el chavismo venezolano (Chávez, 1999-2013), el correísmo ecuatoriano (Correa, 2007-2017), el kirchnerismo argentino (Kirchner-Fernández) y el MAS boliviano (Evo Morales). En Colombia se concreta con el liderazgo de Gustavo Petro desde finales de los 2000.',
    keyThinkers: [
      'Ernesto Laclau',
      'Chantal Mouffe',
      'Juan Domingo Perón',
      'Hugo Chávez',
      'Álvaro García Linera',
    ],
    historicalExamples: [
      'Peronismo argentino (1946-1955, 1973-)',
      'Chavismo venezolano (1999-)',
      'MAS boliviano bajo Evo Morales (2006-2019)',
      'Colombia Humana / Pacto Histórico (2018-)',
    ],
    relatedIdeologies: ['democratic-socialism', 'progressivism', 'social-democracy'],
    externalLinks: [
      { title: 'Laclau — On Populist Reason', url: 'https://www.versobooks.com/books/1644-on-populist-reason', outlet: 'Verso' },
      { title: 'Populismos en América Latina', url: 'https://nuso.org', outlet: 'Nueva Sociedad' },
    ],
  },

  technocracy: {
    longDescription:
      'La tecnocracia defiende que las decisiones políticas deben tomarse con base en el mejor conocimiento experto disponible — economistas, ingenieros, científicos — y no con base en ideologías o preferencias electorales de corto plazo. Propone instituciones independientes (bancos centrales autónomos, comisiones regulatorias técnicas, cortes especializadas) y fortalece el servicio civil profesional. Suele combinarse con posiciones centristas o liberales moderadas en lo económico.\n\nEn Colombia es la doctrina implícita del Banco de la República (autonomía desde 1991), de Planeación Nacional, del Ministerio de Hacienda y de figuras como Juan Daniel Oviedo (ex-director DANE), Sergio Fajardo, Alejandro Gaviria, José Antonio Ocampo, Jorge Iván González, Juan Carlos Echeverry, Rudolf Hommes y Guillermo Perry. Su marca distintiva es el discurso basado en evidencia, microdatos, gestión pública basada en resultados y reforma institucional técnica.\n\nSu crítica más común es el "déficit democrático": privilegiar experticia puede debilitar la participación ciudadana y la representación política. Sus defensores responden que la democracia se fortalece con instituciones técnicas sólidas que producen decisiones verificables.',
    historicalContext:
      'Término acuñado por William Henry Smyth (1919) en EE.UU. como alternativa al sistema político partidista. Gana fuerza con el New Deal (Roosevelt, años 30), la Quinta República francesa de De Gaulle (1958-) y los gobiernos tecnocráticos italianos (Monti 2011-2013, Draghi 2021-2022). En Colombia se consolida con la Constitución de 1991 que autonomizó el Banco de la República y creó órganos reguladores independientes.',
    keyThinkers: [
      'Thorstein Veblen',
      'Howard Scott',
      'Mario Monti',
      'Rudolf Hommes',
      'José Antonio Ocampo',
    ],
    historicalExamples: [
      'Gobierno técnico de Mario Monti en Italia (2011-2013)',
      'Banco de la República de Colombia autónomo (desde 1991)',
      'Fajardismo en Antioquia y Medellín',
      'Gobierno de Mario Draghi en Italia (2021-2022)',
    ],
    relatedIdeologies: ['third-way', 'social-liberalism', 'liberal-conservatism'],
    externalLinks: [
      { title: 'Technocracy — Stanford Encyclopedia', url: 'https://plato.stanford.edu/entries/expertise/', outlet: 'Stanford' },
      { title: 'Fajardo y la tecnocracia en Antioquia', url: 'https://razonpublica.com', outlet: 'Razón Pública' },
    ],
  },

  'traditionalist-conservatism': {
    longDescription:
      'El conservadurismo tradicionalista defiende la continuidad de las instituciones, valores y costumbres heredadas — familia, religión, jerarquías sociales, tradición jurídica — contra cualquier reforma radical. Se distingue del nacionalismo por su énfasis en lo orgánico-comunitario local (municipio, parroquia, familia) y no en la nación abstracta, y del conservadurismo liberal por su mayor escepticismo frente al mercado y al individualismo moderno.\n\nEn Colombia es la matriz del ala laureanista del Partido Conservador (Laureano Gómez, Álvaro Gómez Hurtado), del discurso pro-familia tradicional, del Partido Colombia Justa Libres (con lectura evangélica), de sectores del MIRA y de la Iglesia Católica jerárquica en su intervención política. Su discurso enfatiza la defensa de la vida desde la concepción, de la familia heterosexual, de la propiedad agraria tradicional y de la autoridad moral.\n\nSu tensión con el liberalismo (incluso conservador-liberal) es fuerte: el tradicionalismo resiste activamente la autonomía del individuo cuando colisiona con el orden moral heredado.',
    historicalContext:
      'Raíces en el contrarrevolucionario Joseph de Maistre (1753-1821), en Edmund Burke (con matices), en Louis de Bonald y en el romanticismo conservador del siglo XIX. Se reactiva en el siglo XX con Russell Kirk en EE.UU. y figuras de la derecha católica continental. En Colombia se consolida con el conservadurismo laureanista durante la Violencia (1946-1953) y contemporáneamente con movimientos provida y profamilia (Viviane Morales, Alejandro Ordóñez).',
    keyThinkers: ['Joseph de Maistre', 'Edmund Burke', 'Russell Kirk', 'Laureano Gómez'],
    historicalExamples: [
      'Restauración monárquica europea (1815-1848)',
      'Conservadurismo laureanista en Colombia (1946-1953)',
      'Consulta antiadopción promovida por Viviane Morales (2017)',
    ],
    relatedIdeologies: [
      'social-conservatism',
      'liberal-conservatism',
      'christian-democracy',
      'paleo-conservatism',
    ],
    externalLinks: [
      { title: 'Russell Kirk — The Conservative Mind', url: 'https://www.amazon.com/Conservative-Mind-Burke-Eliot/dp/0895261715', outlet: 'Regnery' },
      { title: 'Conservadurismo tradicionalista en Colombia', url: 'https://razonpublica.com', outlet: 'Razón Pública' },
    ],
  },
};

const data = JSON.parse(readFileSync(INPUT, 'utf-8'));

let enriched = 0;
const result = data.map((ide) => {
  const upd = ENRICHED[ide.id];
  if (!upd) return ide;
  enriched++;
  return {
    ...ide,
    longDescription: upd.longDescription ?? ide.longDescription,
    historicalContext: upd.historicalContext ?? ide.historicalContext,
    keyThinkers: upd.keyThinkers ?? ide.keyThinkers,
    historicalExamples: upd.historicalExamples ?? ide.historicalExamples,
    relatedIdeologies: upd.relatedIdeologies ?? ide.relatedIdeologies,
    externalLinks: upd.externalLinks ?? ide.externalLinks,
  };
});

writeFileSync(INPUT, JSON.stringify(result, null, 2) + '\n', 'utf-8');

const avgLongBefore = data.reduce((s, i) => s + (i.longDescription?.length || 0), 0) / data.length;
const avgLongAfter = result.reduce((s, i) => s + (i.longDescription?.length || 0), 0) / result.length;

console.log(`✓ Enriched ${enriched} Colombia-relevant ideologies.`);
console.log(`  longDescription avg: ${avgLongBefore.toFixed(0)} → ${avgLongAfter.toFixed(0)} chars`);
