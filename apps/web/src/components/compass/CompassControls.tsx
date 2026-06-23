/** Controles de zoom del compass (acercar / alejar / reiniciar). */

type CompassControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function CompassControls({ onZoomIn, onZoomOut, onReset }: CompassControlsProps) {
  const handle = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className="compass-controls" data-click-through>
      <button type="button" onClick={handle(onZoomIn)} aria-label="Acercar" className="compass-control-btn">
        +
      </button>
      <button type="button" onClick={handle(onZoomOut)} aria-label="Alejar" className="compass-control-btn">
        −
      </button>
      <button
        type="button"
        onClick={handle(onReset)}
        aria-label="Reiniciar"
        className="compass-control-btn"
        style={{ fontSize: 12 }}
      >
        ⊚
      </button>
    </div>
  );
}
