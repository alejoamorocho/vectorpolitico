import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { Ideology, EntitySummary, Party } from '@brujula/schema';
import Compass from './Compass';
import { CompassSidebar, type CompassLayerState } from './CompassSidebar';

type Props = {
  ideologies: Ideology[];
  entities: EntitySummary[];
  parties: Party[];
};

const INITIAL_LAYERS: CompassLayerState = {
  selfPerceived: true,
  evidenced: true,
  arrows: true,
  parties: true,
};

export default function CompassWithModal({ ideologies, entities, parties }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layers, setLayers] = useState<CompassLayerState>(INITIAL_LAYERS);
  const [filterType, setFilterType] = useState('all');
  const [filterParty, setFilterParty] = useState('all');
  const [searchSelectedId, setSearchSelectedId] = useState<string | null>(null);

  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      // When a search result is selected, bypass all other filters for that entity
      if (searchSelectedId && e.id === searchSelectedId) return true;
      if (filterType !== 'all' && e.type !== filterType) return false;
      if (filterParty !== 'all' && e.party !== filterParty) return false;
      return true;
    });
  }, [entities, filterType, filterParty, searchSelectedId]);

  // Only show entities if at least one point layer is active
  const visibleEntities = useMemo(() => {
    if (!layers.selfPerceived && !layers.evidenced) return [];
    // When a search result is selected, show ONLY that entity for focus
    if (searchSelectedId) {
      const only = filteredEntities.filter((e) => e.id === searchSelectedId);
      if (only.length > 0) return only;
    }
    return filteredEntities;
  }, [filteredEntities, layers.selfPerceived, layers.evidenced, searchSelectedId]);

  // Filter parties based on selected filterParty
  const visibleParties = useMemo(() => {
    if (!layers.parties) return [];
    if (filterParty === 'all') return parties;
    return parties.filter((p) => p.id === filterParty);
  }, [parties, filterParty, layers.parties]);

  const compassLayers = useMemo(
    () => ({
      grid: true,
      axes: true,
      entities: layers.selfPerceived || layers.evidenced,
      arrows: layers.arrows,
      quadrantLabels: true,
      showSelfPerceived: layers.selfPerceived,
      showEvidenced: layers.evidenced,
      showParties: layers.parties,
    }),
    [layers],
  );

  const enterFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => setIsFullscreen(true));
    } else {
      setIsFullscreen(true);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const handleIdeologyClick = (id: string) => {
    window.location.href = `/ideologias/${id}`;
  };

  const handleEntityClick = (id: string) => {
    window.location.href = `/figuras/${id}`;
  };

  const handlePartyClick = (id: string) => {
    window.location.href = `/partidos/${id}`;
  };

  return (
    <div
      ref={containerRef}
      className={`compass-container ${isFullscreen ? 'compass-container--fullscreen' : ''}`}
    >
      <CompassSidebar
        layers={layers}
        onLayerChange={setLayers}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterParty={filterParty}
        onFilterPartyChange={setFilterParty}
        parties={parties}
        searchEntities={entities}
        searchSelectedId={searchSelectedId}
        onSearchSelect={setSearchSelectedId}
        onFullscreen={enterFullscreen}
        onCollapse={exitFullscreen}
        isFullscreen={isFullscreen}
      />
      <div className="compass-container-map">
        <Compass
          ideologies={ideologies}
          entities={visibleEntities}
          parties={visibleParties}
          modalMode={true}
          layers={compassLayers}
          onIdeologyClick={handleIdeologyClick}
          onEntityClick={handleEntityClick}
          onPartyClick={handlePartyClick}
        />
      </div>
    </div>
  );
}
