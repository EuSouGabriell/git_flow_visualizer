import { useState } from "react";
import "./App.css";

function App() {
  const [strategy, setStrategy] = useState("GitFlow");

  const strategies = ["GitFlow", "GitHub Flow", "Trunk-Based", "GitLab"];

  return (
    <>
      <div className="container" style={{ background: "red" }}>
        <div className="header" style={{ background: "green" }}>
          <div className="header_title">GitFlow Visualizer</div>
          <div className="header_subtitle">
            Estratégias de branching interativas
          </div>
        </div>
        {/* Toggle de estratégias */}
        <div className="header_toggle">
          {strategies.map((item) => {
            const active = strategy === item;

            return (
              <button
                key={item}
                onClick={() => setStrategy(item)}
                style={{
                  padding: "7px 13px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: active ? 700 : 400,
                  background: active ? "#22c55e" : "transparent",
                  color: active ? "#000" : "#fff",
                  transition: "all .2s ease",
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="terminal_git" style={{ background: "red" }}>
        Terminal
      </div>

      <div className="controls" style={{ background: "orange" }}>
        <div className="controls">
          <div className="controls__branches">
            <button>main</button>
            <button>develop</button>
            <button>feature/login</button>
          </div>

          <div className="controls__actions">
            <button>Commit</button>

            <select>
              <option>main</option>
              <option>develop</option>
              <option>feature/login</option>
            </select>

            <button>Merge</button>
            <button>Rebase</button>
            <button>Cherry-pick</button>
            <button>Reset</button>
          </div>
        </div>
      </div>

      <div className="content" style={{ background: "pink" }}>
        conteudo
      </div>
    </>
  );
}

export default App;
