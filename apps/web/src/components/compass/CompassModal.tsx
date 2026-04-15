import { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Compass as CompassIcon,
  MagnifyingGlass,
  StackSimple,
  FunnelSimple,
  ArrowSquareOut,
  BookOpen,
  Buildings,
  UsersThree,
  Path,
  GridFour,
  Crosshair,
  Books,
  Globe,
  Archive,
  Newspaper,
  GraduationCap,
} from '@phosphor-icons/react';
import type { Ideology, EntitySummary, Party } from '@brujula/schema';
import Compass from './Compass';
import { getIdeologyLinks, getPartyLinks, type ExternalLink } from './lib/external-links';
import { QUADRANT_META } from './lib/quadrant-colors';

/**
 * Modal fullscreen del compass.
 *
 * Funcionalidades:
 *  - Click en celda de ideología → panel de detalle con enlaces externos.
 *  - Click en figura → panel de detalle con enlace al perfil interno.
 *  - Sistema de capas toggleable (cuadrícula, ejes, elipses, flechas, figuras).
 *  - Filtros por tipo de cargo, partido, confianza.
 *  - Cierre con ESC o botón X.
 *  - Scroll-locked el body mientras el modal está abierto.
 */

export type CompassLayers = {
  grid: boolean;
  axes: boolean;
  entities: boolean;
  arrows: boolean;
  quadrantLabels: boolean;
};

const DEFAULT_LAYERS: CompassLayers = {
  grid: true,
  axes: true,
  entities: true,
  arrows: true,
  quadrantLabels: true,
};

type Selection =
  | { kind: 'ideology'; data: Ideology }
  | { kind: 'entity'; data: EntitySummary }
  | null;

type Props = {
  ideologies: Ideology[];
  entities: EntitySummary[];
  parties: Party[];
  open: boolean;
  onClose: () => void;
};

export default function CompassModal({
  ideologies,
  entities,
  parties,
  open,
  onClose,
}: Props) {
  const [layers, setLayers] = useState<CompassLayers>(DEFAULT_LAYERS);
  const [selection, setSelection] = useState<Selection>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterParty, setFilterParty] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [search, setSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Body scroll lock + ESC close
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Filtered entities
  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      if (filterType !== 'all' && e.type !== filterType) return false;
      if (filterParty !== 'all' && e.party !== filterParty) return false;
      if (filterConfidence !== 'all' && e.compassEvidenced.confidence !== filterConfidence)
        return false;
      if (search && !e.displayName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [entities, filterType, filterParty, filterConfidence, search]);

  // Filtered ideologies por búsqueda (solo texto)
  const visibleIdeologies = useMemo(() => {
    if (!search) return ideologies;
    const q = search.toLowerCase();
    return ideologies.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.nameEn && i.nameEn.toLowerCase().includes(q)),
    );
  }, [ideologies, search]);

  if (!open) return null;

  const toggleLayer = (key: keyof CompassLayers) =>
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      className="compass-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="compass-modal-panel" ref={panelRef}>
        {/* ── Header masthead ── */}
        <div className="compass-modal-header">
          <div>
            <h2 className="compass-modal-title">La Brújula</h2>
            <p className="compass-modal-subtitle">
              {filteredEntities.length} figuras · {visibleIdeologies.length} ideologías
            </p>
          </div>
          <button
            type="button"
            className="compass-controls-close"
            onClick={onClose}
            aria-label="Cerrar"
            style={{ position: 'static' }}
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        {/* ── Body: canvas + sidebar ── */}
        <div className="compass-modal-body">
          {/* Canvas del compass */}
          <div className="compass-modal-canvas">
            <Compass
              ideologies={layers.grid ? ideologies : []}
              entities={layers.entities ? filteredEntities : []}
              layers={layers}
              modalMode
              onIdeologyClick={(id) => {
                const ide = ideologies.find((i) => i.id === id);
                if (ide) setSelection({ kind: 'ideology', data: ide });
              }}
              onEntityClick={(id) => {
                const ent = entities.find((e) => e.id === id);
                if (ent) setSelection({ kind: 'entity', data: ent });
              }}
            />
          </div>

          {/* Sidebar */}
          <aside className="compass-modal-sidebar">
            {selection ? (
              <DetailPanel
                selection={selection}
                parties={parties}
                ideologies={ideologies}
                onClose={() => setSelection(null)}
              />
            ) : (
              <ControlPanel
                layers={layers}
                toggleLayer={toggleLayer}
                search={search}
                setSearch={setSearch}
                filterType={filterType}
                setFilterType={setFilterType}
                filterParty={filterParty}
                setFilterParty={setFilterParty}
                filterConfidence={filterConfidence}
                setFilterConfidence={setFilterConfidence}
                parties={parties}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ControlPanel — panel por defecto
// ═════════════════════════════════════════════════════════════

type ControlPanelProps = {
  layers: CompassLayers;
  toggleLayer: (key: keyof CompassLayers) => void;
  search: string;
  setSearch: (v: string) => void;
  filterType: string;
  setFilterType: (v: string) => void;
  filterParty: string;
  setFilterParty: (v: string) => void;
  filterConfidence: string;
  setFilterConfidence: (v: string) => void;
  parties: Party[];
};

function ControlPanel({
  layers,
  toggleLayer,
  search,
  setSearch,
  filterType,
  setFilterType,
  filterParty,
  setFilterParty,
  filterConfidence,
  setFilterConfidence,
  parties,
}: ControlPanelProps) {
  return (
    <>
      {/* Buscador */}
      <div className="compass-modal-sidebar-section">
        <SectionTitle icon={<MagnifyingGlass size={14} weight="regular" />}>
          Buscar
        </SectionTitle>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nombre de figura o ideología…"
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--paper-cream)',
            border: '1px solid var(--rule)',
            fontFamily: 'var(--font-serif)',
            fontSize: 14,
            fontStyle: 'italic',
            color: 'var(--ink-soft)',
            outline: 'none',
          }}
        />
      </div>

      {/* Capas */}
      <div className="compass-modal-sidebar-section">
        <SectionTitle icon={<StackSimple size={14} weight="regular" />}>
          Capas
        </SectionTitle>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <LayerToggle
            icon={<GridFour size={15} weight="duotone" />}
            label="Cuadrícula de ideologías"
            active={layers.grid}
            onToggle={() => toggleLayer('grid')}
          />
          <LayerToggle
            icon={<Crosshair size={15} weight="duotone" />}
            label="Ejes y cuadrantes"
            active={layers.axes}
            onToggle={() => toggleLayer('axes')}
          />
          <LayerToggle
            icon={<UsersThree size={15} weight="duotone" />}
            label="Figuras políticas"
            active={layers.entities}
            onToggle={() => toggleLayer('entities')}
          />
          <LayerToggle
            icon={<Path size={15} weight="duotone" />}
            label="Flechas de coherencia"
            active={layers.arrows}
            onToggle={() => toggleLayer('arrows')}
          />
        </ul>
      </div>

      {/* Filtros */}
      <div className="compass-modal-sidebar-section">
        <SectionTitle icon={<FunnelSimple size={14} weight="regular" />}>
          Filtros
        </SectionTitle>

        <FilterSelect
          label="Cargo"
          value={filterType}
          onChange={setFilterType}
          options={[
            ['all', 'Todos'],
            ['president', 'Presidentes'],
            ['presidential_candidate', 'Candidatos'],
            ['senator', 'Senadores'],
            ['representative', 'Representantes'],
            ['governor', 'Gobernadores'],
            ['mayor', 'Alcaldes'],
          ]}
        />
        <FilterSelect
          label="Partido"
          value={filterParty}
          onChange={setFilterParty}
          options={[
            ['all', 'Todos'],
            ...parties.map((p) => [p.id, p.name] as [string, string]),
          ]}
        />
        <FilterSelect
          label="Confianza"
          value={filterConfidence}
          onChange={setFilterConfidence}
          options={[
            ['all', 'Todas'],
            ['high', 'Alta'],
            ['medium', 'Media'],
            ['low', 'Baja'],
          ]}
        />
      </div>

      {/* Instrucciones */}
      <div className="compass-modal-sidebar-section">
        <p
          style={{
            fontSize: 12,
            fontStyle: 'italic',
            color: 'var(--ink-mute)',
            lineHeight: 1.5,
            borderLeft: '2px solid var(--rule)',
            paddingLeft: 12,
          }}
        >
          Haz click en cualquier ideología o figura para ver su detalle, enlaces a fuentes externas y
          contexto histórico.
        </p>
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// DetailPanel — al seleccionar algo
// ═════════════════════════════════════════════════════════════

function DetailPanel({
  selection,
  parties,
  ideologies,
  onClose,
}: {
  selection: NonNullable<Selection>;
  parties: Party[];
  ideologies: Ideology[];
  onClose: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onClose}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          fontStyle: 'italic',
          color: 'var(--ink-mute)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: 20,
        }}
      >
        ← Volver a controles
      </button>

      {selection.kind === 'ideology' ? (
        <IdeologyDetail ideology={selection.data} />
      ) : (
        <EntityDetail entity={selection.data} parties={parties} ideologies={ideologies} />
      )}
    </div>
  );
}

function IdeologyDetail({ ideology }: { ideology: Ideology }) {
  const links = getIdeologyLinks(ideology);
  const quadMeta = QUADRANT_META[ideology.quadrant];

  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
          marginBottom: 6,
        }}
      >
        {quadMeta.short} · Ideología
      </p>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.05,
          margin: 0,
          color: 'var(--ink)',
        }}
      >
        {ideology.name}
      </h3>
      {ideology.nameEn && (
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--ink-mute)',
            margin: '4px 0 0',
          }}
        >
          {ideology.nameEn}
        </p>
      )}

      <div
        style={{
          margin: '14px 0',
          padding: '10px 12px',
          background: quadMeta.ink + '0d',
          borderLeft: `3px solid ${quadMeta.ink}`,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--ink-soft)',
        }}
      >
        ({ideology.x.toFixed(1)}, {ideology.y.toFixed(1)}) · {ideology.width.toFixed(1)}×
        {ideology.height.toFixed(1)}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--ink-soft)',
          margin: '16px 0',
        }}
      >
        {ideology.description}
      </p>

      {ideology.keyThinkers && ideology.keyThinkers.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <SectionTitle icon={<BookOpen size={14} weight="regular" />}>
            Pensadores clave
          </SectionTitle>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13 }}>
            {ideology.keyThinkers.map((t) => (
              <li
                key={t}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  padding: '4px 0',
                  borderBottom: '1px solid var(--rule-soft)',
                  color: 'var(--ink-soft)',
                }}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ideology.historicalExamples && ideology.historicalExamples.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <SectionTitle icon={<Archive size={14} weight="regular" />}>
            Ejemplos históricos
          </SectionTitle>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13 }}>
            {ideology.historicalExamples.map((ex) => (
              <li
                key={ex}
                style={{
                  fontFamily: 'var(--font-serif)',
                  padding: '4px 0',
                  color: 'var(--ink-soft)',
                }}
              >
                · {ex}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <SectionTitle icon={<Globe size={14} weight="regular" />}>
          Fuentes externas
        </SectionTitle>
        <ExternalLinksList links={links} />
      </div>
    </div>
  );
}

function EntityDetail({ entity, parties, ideologies }: { entity: EntitySummary; parties: Party[]; ideologies: Ideology[] }) {
  const party = entity.party ? parties.find((p) => p.id === entity.party) : undefined;
  const selfIde = entity.ideologySelf ? ideologies.find((i) => i.id === entity.ideologySelf) : undefined;
  const evidIde = entity.ideologyEvidenced ? ideologies.find((i) => i.id === entity.ideologyEvidenced) : undefined;
  const deltaLabel =
    entity.delta < 3
      ? 'alta'
      : entity.delta < 6
        ? 'media'
        : entity.delta < 10
          ? 'baja'
          : 'severa';

  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
          marginBottom: 6,
        }}
      >
        {entity.type.replace('_', ' ')}
      </p>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.05,
          margin: 0,
          color: 'var(--ink)',
        }}
      >
        {entity.displayName}
      </h3>

      {party && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            margin: '8px 0 0',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--ink-mute)',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: party.color,
              display: 'inline-block',
            }}
          />
          {party.name}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          margin: '18px 0',
        }}
      >
        <div
          style={{
            background: 'var(--paper-cream)',
            border: '1px solid var(--rule)',
            padding: '10px 12px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--ink-mute)',
              margin: 0,
            }}
          >
            Delta coherencia
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 700,
              margin: '2px 0 0',
              color: 'var(--ink)',
            }}
          >
            {entity.delta.toFixed(1)}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 11,
              color: 'var(--ink-mute)',
              margin: '2px 0 0',
            }}
          >
            {deltaLabel}
          </p>
        </div>
        <div
          style={{
            background: 'var(--paper-cream)',
            border: '1px solid var(--rule)',
            padding: '10px 12px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--ink-mute)',
              margin: 0,
            }}
          >
            Confianza
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 600,
              margin: '6px 0 0',
              color: 'var(--ink)',
              textTransform: 'capitalize',
            }}
          >
            {entity.compassEvidenced.confidence}
          </p>
        </div>
      </div>

      {/* Ideologías auto-percibida y evidenciada */}
      <div
        style={{
          display: 'grid',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {selfIde && (
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--paper-cream)',
              border: '1px solid var(--rule)',
              borderLeft: '3px solid var(--self)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--self)',
                margin: 0,
              }}
            >
              ● Se percibe como
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 600,
                margin: '4px 0 0',
                color: 'var(--ink)',
              }}
            >
              {selfIde.name}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 11,
                color: 'var(--ink-mute)',
                margin: '4px 0 0',
                lineHeight: 1.4,
              }}
            >
              {selfIde.description.slice(0, 120)}{selfIde.description.length > 120 ? '…' : ''}
            </p>
          </div>
        )}
        {evidIde && (
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--paper-cream)',
              border: '1px solid var(--rule)',
              borderLeft: '3px solid var(--evidenced)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--evidenced)',
                margin: 0,
              }}
            >
              ● Evidenciado como
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 600,
                margin: '4px 0 0',
                color: 'var(--ink)',
              }}
            >
              {evidIde.name}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 11,
                color: 'var(--ink-mute)',
                margin: '4px 0 0',
                lineHeight: 1.4,
              }}
            >
              {evidIde.description.slice(0, 120)}{evidIde.description.length > 120 ? '…' : ''}
            </p>
          </div>
        )}
      </div>

      <a
        href={`/figuras/${entity.id}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'var(--ink)',
          color: 'var(--paper-cream)',
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          textDecoration: 'none',
          border: '1px solid var(--ink)',
          transition: 'opacity 150ms ease',
        }}
      >
        <ArrowSquareOut size={14} weight="bold" />
        Ver perfil completo
      </a>

      {party && (
        <div style={{ marginTop: 22 }}>
          <SectionTitle icon={<Buildings size={14} weight="regular" />}>
            Partido
          </SectionTitle>
          <a
            href={`/partidos/${party.id}`}
            style={{
              display: 'block',
              padding: '12px 14px',
              background: 'var(--paper-cream)',
              border: '1px solid var(--rule)',
              textDecoration: 'none',
              marginTop: 6,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                color: 'var(--ink)',
              }}
            >
              {party.name}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 12,
                color: 'var(--ink-mute)',
                margin: '2px 0 0',
              }}
            >
              {party.fullName}
            </p>
          </a>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Primitives
// ═════════════════════════════════════════════════════════════

function SectionTitle({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--ink-mute)',
        marginBottom: 10,
      }}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}

function LayerToggle({
  icon,
  label,
  active,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '8px 0',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid var(--rule-soft)',
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          color: active ? 'var(--ink)' : 'var(--ink-faint)',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'color 150ms ease',
        }}
      >
        <span style={{ color: active ? 'var(--ink-soft)' : 'var(--ink-faint)' }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        <span
          style={{
            width: 28,
            height: 16,
            background: active ? 'var(--ink-soft)' : 'var(--rule)',
            position: 'relative',
            borderRadius: 8,
            transition: 'background 180ms ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: active ? 14 : 2,
              width: 12,
              height: 12,
              background: 'var(--paper-cream)',
              borderRadius: '50%',
              transition: 'left 180ms ease',
            }}
          />
        </span>
      </button>
    </li>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label style={{ display: 'block', marginBottom: 10 }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 12,
          color: 'var(--ink-mute)',
          display: 'block',
          marginBottom: 4,
        }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '7px 10px',
          background: 'var(--paper-cream)',
          border: '1px solid var(--rule)',
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          color: 'var(--ink-soft)',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

function ExternalLinksList({ links }: { links: ExternalLink[] }) {
  const iconFor = (type: ExternalLink['type']) => {
    switch (type) {
      case 'encyclopedia':
        return <BookOpen size={14} weight="duotone" />;
      case 'academic':
        return <GraduationCap size={14} weight="duotone" />;
      case 'archive':
        return <Archive size={14} weight="duotone" />;
      case 'news':
        return <Newspaper size={14} weight="duotone" />;
      case 'official':
        return <Buildings size={14} weight="duotone" />;
      default:
        return <Globe size={14} weight="duotone" />;
    }
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {links.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 0',
              borderBottom: '1px solid var(--rule-soft)',
              fontFamily: 'var(--font-serif)',
              fontSize: 13,
              color: 'var(--ink-soft)',
              textDecoration: 'none',
            }}
          >
            <span style={{ color: 'var(--ink-mute)' }}>{iconFor(link.type)}</span>
            <span style={{ flex: 1, fontStyle: 'italic' }}>{link.label}</span>
            <ArrowSquareOut size={12} weight="regular" style={{ color: 'var(--ink-faint)' }} />
          </a>
        </li>
      ))}
    </ul>
  );
}
