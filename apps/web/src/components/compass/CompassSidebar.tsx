// apps/web/src/components/compass/CompassSidebar.tsx
import { useState, useMemo, useRef, useEffect } from 'react';
import type { Party, EntitySummary } from '@brujula/schema';
import { entityTypeLabel } from '@/lib/i18n';

export type CompassLayerState = {
  selfPerceived: boolean;
  evidenced: boolean;
  arrows: boolean;
  parties: boolean;
};

type Props = {
  layers: CompassLayerState;
  onLayerChange: (layers: CompassLayerState) => void;
  filterType: string;
  onFilterTypeChange: (v: string) => void;
  filterParty: string;
  onFilterPartyChange: (v: string) => void;
  parties: Party[];
  /** Todas las entidades para la búsqueda (sin filtrar por type/party). */
  searchEntities: EntitySummary[];
  /** ID de la entidad seleccionada en búsqueda (para hacer focus en el mapa). */
  searchSelectedId: string | null;
  onSearchSelect: (id: string | null) => void;
  onFullscreen?: () => void;
  onCollapse?: () => void;
  isFullscreen?: boolean;
};

const typeFilterOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos los cargos' },
  { value: 'president', label: 'Presidentes' },
  { value: 'vice_president', label: 'Vicepresidentes' },
  { value: 'presidential_candidate', label: 'Candidatos presidenciales' },
  { value: 'vp_candidate', label: 'Candidatos a vicepresidente' },
  { value: 'senator', label: 'Senadores' },
  { value: 'representative', label: 'Representantes' },
  { value: 'governor', label: 'Gobernadores' },
  { value: 'mayor', label: 'Alcaldes' },
];

export function CompassSidebar({
  layers,
  onLayerChange,
  filterType,
  onFilterTypeChange,
  filterParty,
  onFilterPartyChange,
  parties,
  searchEntities,
  searchSelectedId,
  onSearchSelect,
  onFullscreen,
  onCollapse,
  isFullscreen = false,
}: Props) {
  const toggle = (key: keyof CompassLayerState) => {
    onLayerChange({ ...layers, [key]: !layers[key] });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const searchResults = useMemo(() => {
    const q = normalize(searchQuery.trim());
    if (!q) return [];
    return searchEntities
      .filter((e) => normalize(e.displayName).includes(q))
      .slice(0, 12);
  }, [searchQuery, searchEntities]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedEntity = searchSelectedId
    ? searchEntities.find((e) => e.id === searchSelectedId)
    : null;

  return (
    <aside className="compass-sidebar" aria-label="Controles del mapa">
      {/* Header */}
      <div className="compass-sidebar-header">
        <span className="compass-sidebar-title">Brújula Política</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {!isFullscreen && onFullscreen && (
            <button
              type="button"
              onClick={onFullscreen}
              className="compass-sidebar-btn"
              aria-label="Pantalla completa"
              title="Pantalla completa"
            >
              ⛶
            </button>
          )}
          {isFullscreen && onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="compass-sidebar-btn"
              aria-label="Salir de pantalla completa"
              title="Cerrar"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="compass-sidebar-section" ref={searchRef}>
        <div className="compass-sidebar-section-title">Buscar</div>
        <div className="compass-sidebar-search">
          <input
            type="search"
            className="compass-sidebar-search-input"
            placeholder="Nombre de la figura..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            aria-label="Buscar figura política"
          />
          {searchSelectedId && (
            <button
              type="button"
              className="compass-sidebar-search-clear"
              onClick={() => {
                onSearchSelect(null);
                setSearchQuery('');
              }}
              aria-label="Limpiar selección"
              title="Limpiar"
            >
              ×
            </button>
          )}
        </div>
        {isSearchOpen && searchResults.length > 0 && (
          <ul className="compass-sidebar-search-results" role="listbox">
            {searchResults.map((e) => (
              <li key={e.id} role="option" aria-selected={searchSelectedId === e.id}>
                <button
                  type="button"
                  className="compass-sidebar-search-result"
                  onClick={() => {
                    onSearchSelect(e.id);
                    setSearchQuery(e.displayName);
                    setIsSearchOpen(false);
                  }}
                >
                  <span className="compass-sidebar-search-name">{e.displayName}</span>
                  <span className="compass-sidebar-search-type">
                    {entityTypeLabel(e.type)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {isSearchOpen && searchQuery.trim() && searchResults.length === 0 && (
          <p className="compass-sidebar-hint" style={{ marginTop: 6 }}>
            Sin resultados para "{searchQuery}"
          </p>
        )}
        {selectedEntity && !isSearchOpen && (
          <p className="compass-sidebar-hint" style={{ marginTop: 6, color: 'var(--ink-soft)' }}>
            Seleccionado: <strong>{selectedEntity.displayName}</strong>
          </p>
        )}
      </div>

      {/* Capas */}
      <div className="compass-sidebar-section">
        <div className="compass-sidebar-section-title">Capas</div>
        <label className="compass-sidebar-check">
          <input
            type="checkbox"
            checked={layers.selfPerceived}
            onChange={() => toggle('selfPerceived')}
          />
          <span className="compass-sidebar-dot" style={{ background: '#1e3556' }} />
          Autopercibido
        </label>
        <label className="compass-sidebar-check">
          <input
            type="checkbox"
            checked={layers.evidenced}
            onChange={() => toggle('evidenced')}
          />
          <span className="compass-sidebar-dot" style={{ background: '#6b1f1f' }} />
          Evidenciado
        </label>
        <label className="compass-sidebar-check">
          <input
            type="checkbox"
            checked={layers.arrows}
            onChange={() => toggle('arrows')}
          />
          <span className="compass-sidebar-arrow" />
          Flechas
        </label>
        <label className="compass-sidebar-check">
          <input
            type="checkbox"
            checked={layers.parties}
            onChange={() => toggle('parties')}
          />
          <span className="compass-sidebar-diamond" />
          Partidos
        </label>
      </div>

      {/* Filtros */}
      <div className="compass-sidebar-section">
        <div className="compass-sidebar-section-title">Filtros</div>
        <select
          className="compass-sidebar-select"
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
        >
          {typeFilterOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="compass-sidebar-select"
          value={filterParty}
          onChange={(e) => onFilterPartyChange(e.target.value)}
        >
          <option value="all">Todos los partidos</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Guía */}
      <div className="compass-sidebar-section compass-sidebar-guide">
        <div className="compass-sidebar-section-title">Guía</div>
        {layers.selfPerceived && (
          <div className="compass-sidebar-guide-item">
            <span className="compass-sidebar-dot" style={{ background: '#1e3556' }} />
            <span>Dónde dice estar</span>
          </div>
        )}
        {layers.evidenced && (
          <div className="compass-sidebar-guide-item">
            <span className="compass-sidebar-dot" style={{ background: '#6b1f1f' }} />
            <span>Dónde está realmente</span>
          </div>
        )}
        {layers.arrows && (
          <div className="compass-sidebar-guide-item">
            <span className="compass-sidebar-arrow" />
            <span>Distancia discurso ↔ acción</span>
          </div>
        )}
        {layers.parties && (
          <div className="compass-sidebar-guide-item">
            <span className="compass-sidebar-diamond" />
            <span>Posición del partido</span>
          </div>
        )}
        {!layers.selfPerceived && !layers.evidenced && !layers.arrows && !layers.parties && (
          <p className="compass-sidebar-hint">
            Active una capa para ver la guía
          </p>
        )}
      </div>
    </aside>
  );
}
