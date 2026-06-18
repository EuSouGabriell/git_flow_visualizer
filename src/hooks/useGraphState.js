import { useState, useCallback } from 'react';
import STRATEGIES from '../data/strategies';

const STEP = 80;

function cloneGraph(graph) {
  return {
    nodes: graph.nodes.map(n => ({ ...n })),
    edges: graph.edges.map(e => ({ ...e })),
  };
}

function lastNodeOnBranch(nodes, branchId) {
  const branch = nodes.filter(n => n.branchId === branchId);
  if (!branch.length) return null;
  return branch.reduce((a, b) => (a.x > b.x ? a : b));
}

function nextId(nodes, prefix) {
  const count = nodes.filter(n => n.id.startsWith(prefix)).length;
  return `${prefix}${count}`;
}

export default function useGraphState(strategy) {
  const [graphState, setGraphState] = useState(() =>
    cloneGraph(STRATEGIES[strategy].initialGraph)
  );

  const reset = useCallback((newStrategy) => {
    setGraphState(cloneGraph(STRATEGIES[newStrategy ?? strategy].initialGraph));
  }, [strategy]);

  const commit = useCallback((activeBranch) => {
    setGraphState(prev => {
      const nodes = [...prev.nodes];
      const last = lastNodeOnBranch(nodes, activeBranch);
      const x = last ? last.x + STEP : STEP;
      const id = nextId(nodes, activeBranch[0]);
      nodes.push({ id, branchId: activeBranch, x, label: '', type: 'commit' });
      return { nodes, edges: prev.edges };
    });
  }, []);

  const merge = useCallback((activeBranch, targetBranch) => {
    setGraphState(prev => {
      const nodes = [...prev.nodes];
      const edges = [...prev.edges];
      const srcLast = lastNodeOnBranch(nodes, activeBranch);
      const tgtLast = lastNodeOnBranch(nodes, targetBranch);
      if (!srcLast) return prev;
      const x = Math.max(srcLast.x, tgtLast ? tgtLast.x : 0) + STEP;
      const id = nextId(nodes, targetBranch[0] + 'm');
      const newNode = { id, branchId: targetBranch, x, label: 'merge', type: 'merge' };
      nodes.push(newNode);
      edges.push({ from: srcLast.id, to: id, type: 'merge' });
      return { nodes, edges };
    });
  }, []);

  const rebase = useCallback((activeBranch, targetBranch) => {
    setGraphState(prev => {
      const allNodes = prev.nodes;
      const tgtLast = lastNodeOnBranch(allNodes, targetBranch);
      if (!tgtLast) return prev;

      const srcNodes = allNodes
        .filter(n => n.branchId === activeBranch)
        .sort((a, b) => a.x - b.x);

      let offset = tgtLast.x + STEP;
      const updatedIds = new Map();
      const updatedNodes = allNodes.map(n => {
        if (n.branchId !== activeBranch) return n;
        const updated = { ...n, x: offset };
        updatedIds.set(n.id, updated.id);
        offset += STEP;
        return updated;
      });

      const rebaseEdge = srcNodes.length > 0
        ? [{ from: tgtLast.id, to: srcNodes[0].id, type: 'rebase' }]
        : [];

      const edges = [
        ...prev.edges.filter(e => e.type !== 'branch' || !srcNodes.find(n => n.id === e.to)),
        ...rebaseEdge,
      ];

      return { nodes: updatedNodes, edges };
    });
  }, []);

  const cherryPick = useCallback((activeBranch, selectedNode) => {
    if (!selectedNode) return;
    setGraphState(prev => {
      const nodes = [...prev.nodes];
      const edges = [...prev.edges];
      const src = nodes.find(n => n.id === selectedNode);
      if (!src || src.branchId === activeBranch) return prev;
      const last = lastNodeOnBranch(nodes, activeBranch);
      const x = last ? last.x + STEP : STEP;
      const id = nextId(nodes, 'cp');
      nodes.push({ id, branchId: activeBranch, x, label: '◆', type: 'cherry-pick' });
      edges.push({ from: src.id, to: id, type: 'cherry-pick' });
      return { nodes, edges };
    });
  }, []);

  const resetLast = useCallback((activeBranch) => {
    setGraphState(prev => {
      const last = lastNodeOnBranch(prev.nodes, activeBranch);
      if (!last) return prev;
      return {
        nodes: prev.nodes.filter(n => n.id !== last.id),
        edges: prev.edges.filter(e => e.from !== last.id && e.to !== last.id),
      };
    });
  }, []);

  return { graphState, commit, merge, rebase, cherryPick, resetLast, reset };
}
