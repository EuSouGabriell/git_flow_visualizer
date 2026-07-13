import './InfoPanel.css';

export default function InfoPanel({ info, strategyName }) {
  const { concept, whenToUse, tradeoffs } = info;

  return (
    <aside className="strategy-brief">
      <header className="strategy-brief__header">
        <span className="strategy-brief__marker" />
        {strategyName}
      </header>

      <div className="strategy-brief__content">
        <section className="brief-section">
          <h2 className="brief-section__title">conceito</h2>
          <p className="brief-section__text">{concept}</p>
        </section>

        <section className="brief-section">
          <h2 className="brief-section__title">quando usar</h2>
          <p className="brief-section__text">{whenToUse}</p>
        </section>

        <section className="brief-section">
          <h2 className="brief-section__title">trade-offs</h2>

          <ul className="brief-list brief-list--pros">
            {tradeoffs.pros.map(item => (
              <li key={item} className="brief-list__item brief-list__item--pro">
                {item}
              </li>
            ))}
          </ul>

          <ul className="brief-list brief-list--cons">
            {tradeoffs.cons.map(item => (
              <li key={item} className="brief-list__item brief-list__item--con">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
