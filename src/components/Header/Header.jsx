import './Header.css';

export default function Header({ strategy, strategies, onStrategyChange }) {
  return (
    <header className="header">
      <div className="header_brand">
        <div>
          <h1 className="header_title">Git Flow Visualizer</h1>
          <p className="header_subtitle">Estratégias de Branching Interativas</p>
        </div>
      </div>

      <nav className="header_nav" aria-label="Estratégias">
        {strategies.map(s => (
          <button
            key={s}
            className={`header_tab ${strategy === s ? 'header_tab--active' : ''}`}
            onClick={() => onStrategyChange(s)}
          >
            {s}
          </button>
        ))}
      </nav>
    </header>
  );
}
