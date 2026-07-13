import { useState } from 'react';
import STRATEGIES from './data/strategies';
import useGraphState from './hooks/useGraphState';
import Header from './components/Header/Header';
import GitGraph from './components/GitGraph/GitGraph';
import Controls from './components/Controls/Controls';
import InfoPanel from './components/InfoPanel/InfoPanel';
import './App.css';

const STRATEGY_NAMES = Object.keys(STRATEGIES);
const DEFAULT_STRATEGY = STRATEGY_NAMES[0];

function getInitialSelection(strategyName) {
  const branches = STRATEGIES[strategyName].branches;
  const active = branches[0]?.id ?? '';
  const target = branches.find(branch => branch.id !== active)?.id ?? '';

  return { active, target };
}

export default function App() {
  const firstSelection = getInitialSelection(DEFAULT_STRATEGY);
  const [strategy, setStrategy] = useState(DEFAULT_STRATEGY);
  const [activeBranch, setActiveBranch] = useState(firstSelection.active);
  const [targetBranch, setTargetBranch] = useState(firstSelection.target);
  const [selectedNode, setSelectedNode] = useState(null);

  const { graphState, commit, merge, rebase, cherryPick, resetLast, reset } =
    useGraphState(strategy);

  const branches = STRATEGIES[strategy].branches;
  const info = STRATEGIES[strategy].info;
  const selectedCommit = graphState.nodes.find(node => node.id === selectedNode) ?? null;

  function handleStrategyChange(newStrategy) {
    const selection = getInitialSelection(newStrategy);

    setStrategy(newStrategy);
    setActiveBranch(selection.active);
    setTargetBranch(selection.target);
    setSelectedNode(null);
    reset(newStrategy);
  }

  function handleBranchChange(branchId) {
    setActiveBranch(branchId);

    if (targetBranch === branchId) {
      const nextTarget = branches.find(branch => branch.id !== branchId)?.id ?? '';
      setTargetBranch(nextTarget);
    }
  }

  function handleClearGraph() {
    const selection = getInitialSelection(strategy);

    setActiveBranch(selection.active);
    setTargetBranch(selection.target);
    setSelectedNode(null);
    reset(strategy);
  }

  function handleResetBranch() {
    resetLast(activeBranch);
    setSelectedNode(null);
  }

  function handleCherryPick() {
    cherryPick(activeBranch, selectedNode);
    setSelectedNode(null);
  }

  return (
    <div className="flow-shell">
      <Header
        strategy={strategy}
        strategies={STRATEGY_NAMES}
        onStrategyChange={handleStrategyChange}
      />

      <main className="flow-workspace">
        <section className="flow-workspace__stage" aria-label="Visualizacao do historico Git">
          <GitGraph
            graphState={graphState}
            branches={branches}
            activeBranch={activeBranch}
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
          />

          <Controls
            branches={branches}
            activeBranch={activeBranch}
            targetBranch={targetBranch}
            selectedCommit={selectedCommit}
            onBranchChange={handleBranchChange}
            onTargetChange={setTargetBranch}
            onCommit={() => commit(activeBranch)}
            onMerge={() => merge(activeBranch, targetBranch)}
            onRebase={() => rebase(activeBranch, targetBranch)}
            onCherryPick={handleCherryPick}
            onResetBranch={handleResetBranch}
            onResetAll={handleClearGraph}
          />
        </section>

        <section className="flow-workspace__notes" aria-label="Resumo da estrategia">
          <InfoPanel info={info} strategyName={strategy} />
        </section>
      </main>
    </div>
  );
}
