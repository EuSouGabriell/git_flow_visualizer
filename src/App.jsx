import { useState, useEffect } from 'react';
import STRATEGIES from './data/strategies';
import useGraphState from './hooks/useGraphState';
import Header from './components/Header/Header';
import GitGraph from './components/GitGraph/GitGraph';
import Controls from './components/Controls/Controls';
import InfoPanel from './components/InfoPanel/InfoPanel';
import './App.css';

const STRATEGY_NAMES = Object.keys(STRATEGIES);

export default function App() {
  const [strategy, setStrategy] = useState(STRATEGY_NAMES[0]);
  const [activeBranch, setActiveBranch] = useState(STRATEGIES[STRATEGY_NAMES[0]].branches[0].id);
  const [targetBranch, setTargetBranch] = useState(STRATEGIES[STRATEGY_NAMES[0]].branches[1]?.id ?? '');
  const [selectedNode, setSelectedNode] = useState(null);

  const { graphState, commit, merge, rebase, cherryPick, resetLast, reset } = useGraphState(strategy);

  const branches = STRATEGIES[strategy].branches;
  const info = STRATEGIES[strategy].info;

  function handleStrategyChange(newStrategy) {
    setStrategy(newStrategy);
    const newBranches = STRATEGIES[newStrategy].branches;
    setActiveBranch(newBranches[0].id);
    setTargetBranch(newBranches[1]?.id ?? '');
    setSelectedNode(null);
    reset(newStrategy);
  }

  function handleBranchChange(branchId) {
    setActiveBranch(branchId);
    const other = branches.find(b => b.id !== branchId);
    if (other) setTargetBranch(other.id);
  }

  return (
    <div className="app">
      <Header
        strategy={strategy}
        strategies={STRATEGY_NAMES}
        onStrategyChange={handleStrategyChange}
      />
      <div className="app_body">
        <div className="app_left">
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
            onBranchChange={handleBranchChange}
            onTargetChange={setTargetBranch}
            onCommit={() => commit(activeBranch)}
            onMerge={() => merge(activeBranch, targetBranch)}
            onRebase={() => rebase(activeBranch, targetBranch)}
            onCherryPick={() => cherryPick(activeBranch, selectedNode)}
            onReset={() => resetLast(activeBranch)}
          />
        </div>
        <div className="app_right">
          <InfoPanel info={info} strategyName={strategy} />
        </div>
      </div>
    </div>
  );
}
