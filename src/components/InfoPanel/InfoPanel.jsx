import './InfoPanel.css';

export default function InfoPanel({ info, strategyName }) {
  const { concept, whenToUse, tradeoffs } = info;

  return (
    <aside className="info-panel">
      <div className="info-panel_header">
        <span className="info-panel_dot" />
        {strategyName}
      </div>

      <div className="info-panel_body">
        <section className="info-section">
          <h2 className="info-section_title">conceito</h2>
          <p className="info-section_text">{concept}</p>
        </section>

        <section className="info-section">
          <h2 className="info-section_title">quando usar</h2>
          <p className="info-section_text">{whenToUse}</p>
        </section>

        <section className="info-section">
          <h2 className="info-section_title">trade-offs</h2>
          <ul className="info-section_list info-section_list--pros">
            {tradeoffs.pros.map((p, i) => (
              <li key={i} className="info-section_item info-section_item--pro">{p}</li>
            ))}
          </ul>
          <ul className="info-section_list info-section_list--cons">
            {tradeoffs.cons.map((c, i) => (
              <li key={i} className="info-section_item info-section_item--con">{c}</li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
