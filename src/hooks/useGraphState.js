import { useState, useCallback } from 'react';
import STRATEGIES from '../data/strategies';

const STEP = 88;

function cloneGraph(graph) {
  return {
    nodes: graph.nodes.map(node => ({ ...node })),
    edges: graph.edges.map(edge => ({ ...edge })),
  };
}

function getBranchNodes(nodes, branchId) {
  return nodes
    .filter(node => node.branchId === branchId)
    .sort((left, right) => left.x - right.x);
}

function lastNodeOnBranch(nodes, branchId) {
  const branchNodes = getBranchNodes(nodes, branchId);
  return branchNodes[branchNodes.length - 1] ?? null;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'node';
}

function makeNodeId(nodes, prefix) {
  const usedIds = new Set(nodes.map(node => node.id));
  const slug = slugify(prefix);
  let index = nodes.length + 1;
  let id = `${slug}-${index}`;

  while (usedIds.has(id)) {
    index += 1;
    id = `${slug}-${index}`;
  }

  return id;
}

function makeEdge(edges, type, from, to) {
  return {
    id: `${type}-${from}-${to}-${edges.length + 1}`,
    from,
    to,
    type,
  };
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
      if (!activeBranch) return prev;

      const nodes = [...prev.nodes];
      const last = lastNodeOnBranch(nodes, activeBranch);
      const branchNodes = getBranchNodes(nodes, activeBranch);
      const x = last ? last.x + STEP : STEP;

      nodes.push({
        id: makeNodeId(nodes, `${activeBranch}-commit`),
        branchId: activeBranch,
        x,
        label: `c${branchNodes.length}`,
        type: 'commit',
      });

      return { nodes, edges: prev.edges };
    });
  }, []);

  const merge = useCallback((activeBranch, targetBranch) => {
    setGraphState(prev => {
      if (!activeBranch || !targetBranch || activeBranch === targetBranch) return prev;

      const nodes = [...prev.nodes];
      const edges = [...prev.edges];
      const sourceLast = lastNodeOnBranch(nodes, activeBranch);
      const targetLast = lastNodeOnBranch(nodes, targetBranch);

      if (!sourceLast || !targetLast) return prev;

      const id = makeNodeId(nodes, `${targetBranch}-merge`);
      const x = Math.max(sourceLast.x, targetLast.x) + STEP;

      nodes.push({
        id,
        branchId: targetBranch,
        x,
        label: 'merge',
        type: 'merge',
      });

      edges.push(makeEdge(edges, 'merge', sourceLast.id, id));

      return { nodes, edges };
    });
  }, []);

  const rebase = useCallback((activeBranch, targetBranch) => {
    setGraphState(prev => {
      if (!activeBranch || !targetBranch || activeBranch === targetBranch) return prev;

      const targetLast = lastNodeOnBranch(prev.nodes, targetBranch);
      const activeNodes = getBranchNodes(prev.nodes, activeBranch);

      if (!targetLast || !activeNodes.length) return prev;

      const nextPositions = new Map(
        activeNodes.map((node, index) => [
          node.id,
          targetLast.x + STEP * (index + 1),
        ])
      );

      const nodes = prev.nodes.map(node => {
        if (!nextPositions.has(node.id)) return node;

        return {
          ...node,
          x: nextPositions.get(node.id),
          rebased: true,
        };
      });

      const firstActiveNode = activeNodes[0];
      const edges = prev.edges.filter(edge => (
        !['branch', 'rebase'].includes(edge.type) || edge.to !== firstActiveNode.id
      ));

      edges.push(makeEdge(edges, 'rebase', targetLast.id, firstActiveNode.id));

      return { nodes, edges };
    });
  }, []);

  const cherryPick = useCallback((activeBranch, selectedNodeId) => {
    if (!selectedNodeId) return;

    setGraphState(prev => {
      if (!activeBranch) return prev;

      const nodes = [...prev.nodes];
      const edges = [...prev.edges];
      const sourceNode = nodes.find(node => node.id === selectedNodeId);

      if (!sourceNode || sourceNode.branchId === activeBranch) return prev;

      const last = lastNodeOnBranch(nodes, activeBranch);
      const x = last ? last.x + STEP : STEP;
      const id = makeNodeId(nodes, `${activeBranch}-pick`);

      nodes.push({
        id,
        branchId: activeBranch,
        x,
        label: sourceNode.label ? `pick ${sourceNode.label}` : 'pick',
        type: 'cherry-pick',
        sourceNodeId: sourceNode.id,
      });

      edges.push(makeEdge(edges, 'cherry-pick', sourceNode.id, id));

      return { nodes, edges };
    });
  }, []);

  const resetLast = useCallback((activeBranch) => {
    setGraphState(prev => {
      if (!activeBranch) return prev;

      const last = lastNodeOnBranch(prev.nodes, activeBranch);
      const initialNodeIds = new Set(
        STRATEGIES[strategy].initialGraph.nodes.map(node => node.id)
      );

      if (!last || initialNodeIds.has(last.id)) return prev;

      return {
        nodes: prev.nodes.filter(node => node.id !== last.id),
        edges: prev.edges.filter(edge => edge.from !== last.id && edge.to !== last.id),
      };
    });
  }, [strategy]);

  return { graphState, commit, merge, rebase, cherryPick, resetLast, reset };
}
