// apps/web/src/components/compass/CompassSidebar.tsx
import type { Party } from '@brujula/schema';

export type CompassLayerState = {
  selfPerceived: boolean;
  evidenced: boolean;
  arrows: boolean;
};

type Props = {
  layers: CompassLayerState;
  onLayerChange: (layers: CompassLayerState) => void;
  filterType: string;
  onFilterTypeChange: (v: string) => void;
  filterParty: string;
  onFilterPartyChange: (v: string) => void;
  parties: Party[];
  onFullscreen?: () => void;
  onCollapse?: () => void;
  isFullscreen?: boolean;
};

const typeFilterOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos los cargos' },
  { value: 'president', label: 'Presidentes' },
  { value: 'vice_president', label: 'Vicepresidentes' },
  { value: 'presidential_candidate', label: 'Candidatos presidenciales' },
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
  onFullscreen,
  onCollapse,
  isFullscreen = false,
}: Props) {
  const toggle = (key: keyof CompassLayerState) => {
    onLayerChange({ ...layers, [key]: !layers[key] });
  };

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
        {!layers.selfPerceived && !layers.evidenced && !layers.arrows && (
          <p className="compass-sidebar-hint">
            Active una capa para ver la guía
          </p>
        )}
      </div>
    </aside>
  );
}
