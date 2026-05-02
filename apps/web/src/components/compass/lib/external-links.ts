/**
 * Enlaces externos estandarizados para ideologías y partidos.
 * Se generan dinámicamente a partir del nombre — así toda entidad del
 * dataset tiene la misma familia de recursos disponibles sin duplicar
 * datos en el JSON.
 */

import type { Ideology, Party } from '@brujula/schema';

export type ExternalLink = {
  label: string;
  url: string;
  type: 'encyclopedia' | 'archive' | 'academic' | 'news' | 'official' | 'other';
};

function slugForUrl(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

function encodeQuery(text: string): string {
  return encodeURIComponent(text);
}

/**
 * Enlaces estándar para una ideología política.
 * Se prioriza el nombre en inglés para Wikipedia ya que tiene mejor cobertura.
 */
export function getIdeologyLinks(ideology: Ideology): ExternalLink[] {
  const nameEn = ideology.nameEn ?? ideology.name;
  const nameEs = ideology.name;

  return [
    {
      label: 'Wikipedia (ES)',
      url: `https://es.wikipedia.org/wiki/${slugForUrl(nameEs)}`,
      type: 'encyclopedia',
    },
    {
      label: 'Wikipedia (EN)',
      url: `https://en.wikipedia.org/wiki/${slugForUrl(nameEn)}`,
      type: 'encyclopedia',
    },
    {
      label: 'Stanford Encyclopedia of Philosophy',
      url: `https://plato.stanford.edu/search/searcher.py?query=${encodeQuery(nameEn)}`,
      type: 'academic',
    },
    {
      label: 'Britannica',
      url: `https://www.britannica.com/search?query=${encodeQuery(nameEn)}`,
      type: 'encyclopedia',
    },
    {
      label: 'Internet Archive',
      url: `https://archive.org/search?query=${encodeQuery(nameEn)}`,
      type: 'archive',
    },
    {
      label: 'Google Scholar',
      url: `https://scholar.google.com/scholar?q=${encodeQuery(nameEn)}`,
      type: 'academic',
    },
  ];
}

/**
 * Enlaces estándar para un partido político.
 */
export function getPartyLinks(party: Party): ExternalLink[] {
  const links: ExternalLink[] = [
    {
      label: 'Wikipedia',
      url: `https://es.wikipedia.org/wiki/${slugForUrl(party.fullName)}`,
      type: 'encyclopedia',
    },
    {
      label: 'CNE · Consejo Nacional Electoral',
      url: `https://www.cne.gov.co/?q=search&keys=${encodeQuery(party.name)}`,
      type: 'official',
    },
    {
      label: 'Registraduría Nacional',
      url: `https://www.registraduria.gov.co/?q=search&keys=${encodeQuery(party.name)}`,
      type: 'official',
    },
    {
      label: 'Google News',
      url: `https://news.google.com/search?q=${encodeQuery(party.name)}&hl=es-419`,
      type: 'news',
    },
    {
      label: 'Internet Archive',
      url: `https://archive.org/search?query=${encodeQuery(party.name)}`,
      type: 'archive',
    },
  ];

  if (party.id === 'pacto-historico') {
    links.unshift({
      label: 'Sitio oficial',
      url: 'https://pactohistorico.co',
      type: 'official',
    });
  }

  return links;
}

/**
 * Enlaces estándar para una figura política.
 */
export function getEntityLinks(displayName: string, fullName: string): ExternalLink[] {
  return [
    {
      label: 'Wikipedia',
      url: `https://es.wikipedia.org/wiki/${slugForUrl(fullName)}`,
      type: 'encyclopedia',
    },
    {
      label: 'CongresoVisible',
      url: `https://congresovisible.uniandes.edu.co/congresistas/perfil/${encodeQuery(displayName.toLowerCase())}`,
      type: 'official',
    },
    {
      label: 'Google News',
      url: `https://news.google.com/search?q=${encodeQuery(displayName)}&hl=es-419`,
      type: 'news',
    },
    {
      label: 'Internet Archive',
      url: `https://archive.org/search?query=${encodeQuery(displayName)}`,
      type: 'archive',
    },
  ];
}
