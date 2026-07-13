import './Header.css';

export default function Header({ strategy, strategies, onStrategyChange }) {
  return (
    <header className="product-header">
      <div className="product-header__brand">
        <h1 className="product-header__title">Git Flow Visualizer</h1>
        <p className="product-header__subtitle">Estrategias de branching interativas</p>
      </div>

      <nav className="strategy-tabs" aria-label="Estrategias">
        {strategies.map(item => (
          <button
            key={item}
            className={`strategy-tabs__button ${strategy === item ? 'strategy-tabs__button--active' : ''}`}
            type="button"
            onClick={() => onStrategyChange(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
}
