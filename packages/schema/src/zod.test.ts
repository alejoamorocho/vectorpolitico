import { describe, it, expect } from 'vitest';
import {
  entitySchema,
  partySchema,
  ideologySchema,
  compassPositionSchema,
  parseEntityOrThrow,
} from './zod';

describe('zod schemas', () => {
  describe('scoreSchema (via compassPosition)', () => {
    it('acepta scores en rango -10..+10', () => {
      const valid = {
        x: -7.5,
        y: 3.2,
        justification: 'Votaciones documentadas en reforma tributaria 2022 y PGN 2023.',
        sources: [
          {
            url: 'https://www.minhacienda.gov.co/ejemplo',
            outlet: 'MHCP',
            date: '2023-03-15',
          },
        ],
      };
      expect(compassPositionSchema.safeParse(valid).success).toBe(true);
    });

    it('rechaza scores fuera de rango', () => {
      const invalid = {
        x: 11,
        y: 0,
        justification: 'texto largo suficiente para pasar la validacion de minimo 20 chars.',
        sources: [{ url: 'https://x.co', outlet: 'X', date: '2023-01-01' }],
      };
      expect(compassPositionSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('ideologySchema', () => {
    it('valida una celda bien formada', () => {
      const valid = {
        id: 'socialismo-democratico',
        name: 'Socialismo Democrático',
        nameEn: 'Democratic Socialism',
        x: -5,
        y: -2,
        width: 2,
        height: 1.5,
        quadrant: 'lib_left',
        color: '#16a34a',
        description:
          'Corriente que combina mecanismos democráticos con propiedad social estratégica.',
      };
      expect(ideologySchema.safeParse(valid).success).toBe(true);
    });

    it('rechaza cuadrante inválido', () => {
      expect(
        ideologySchema.safeParse({
          id: 'test',
          name: 'Test',
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          quadrant: 'bogus',
          color: '#ff0000',
          description: 'descripcion suficientemente larga para superar el minimo.',
        }).success,
      ).toBe(false);
    });
  });

  describe('entitySchema', () => {
    const baseValid = {
      id: 'juanita-perez',
      country: 'co',
      type: 'senator',
      fullName: 'Juanita María Pérez Gómez',
      displayName: 'Juanita Pérez',
      periods: [
        {
          role: 'senator',
          startDate: '2022-07-20',
        },
      ],
      compassSelfPerceived: {
        x: -3,
        y: -2,
        justification: 'Plataforma del partido y declaraciones de campaña coinciden.',
        sources: [
          {
            url: 'https://www.cne.gov.co/plan',
            outlet: 'CNE',
            date: '2022-05-01',
          },
        ],
      },
      compassEvidenced: {
        x: -2.5,
        y: -1.5,
        justification: 'Votaciones en 8 proyectos documentados 2022-2024.',
        sources: [
          {
            url: 'https://congresovisible.uniandes.edu.co/v',
            outlet: 'CongresoVisible',
            date: '2024-06-01',
          },
        ],
        confidence: 'medium',
        dimensionScores: {
          fiscalPolicy: -3,
          marketPosition: -2,
          socialPolicy: -4,
          tradePolicy: -1,
          civilRights: -2,
          securityApproach: 0,
          socialRights: -3,
          powerConcentration: -1,
        },
      },
      ideologies: ['socialismo-democratico'],
      bio: 'Juanita es senadora desde 2022 con trayectoria en el sector privado y activismo.',
      incoherences: [],
      lastUpdated: '2026-04-11',
      contributors: ['github-user-1'],
    };

    it('parsea una entidad completa válida', () => {
      expect(entitySchema.safeParse(baseValid).success).toBe(true);
    });

    it('falla con x fuera de rango', () => {
      const bad = { ...baseValid, compassEvidenced: { ...baseValid.compassEvidenced, x: 15 } };
      expect(entitySchema.safeParse(bad).success).toBe(false);
    });

    it('falla con período con endDate < startDate', () => {
      const bad = {
        ...baseValid,
        periods: [{ role: 'senator', startDate: '2022-07-20', endDate: '2020-01-01' }],
      };
      expect(entitySchema.safeParse(bad).success).toBe(false);
    });

    it('parseEntityOrThrow lanza mensaje legible', () => {
      expect(() => parseEntityOrThrow({ id: 'x' }, 'test.json')).toThrow(/Entidad inválida/);
    });
  });

  describe('partySchema', () => {
    it('valida un partido bien formado', () => {
      const valid = {
        id: 'pacto-historico',
        country: 'co',
        name: 'Pacto Histórico',
        fullName: 'Coalición Pacto Histórico por Colombia',
        color: '#dc2626',
        description: 'Coalición de partidos y movimientos de izquierda fundada en 2021.',
        ideologies: ['socialismo-democratico', 'progresismo'],
        lastUpdated: '2026-04-11',
        contributors: ['github-user-1'],
      };
      expect(partySchema.safeParse(valid).success).toBe(true);
    });
  });
});
