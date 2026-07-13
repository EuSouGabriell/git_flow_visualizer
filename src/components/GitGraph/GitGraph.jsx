import './GitGraph.css';

const NODE_RADIUS = 6;
const NODE_HALO = 13;
const LABEL_OFFSET = 19;
const SVG_PADDING = { top: 28, right: 82, bottom: 34, left: 132 };

function edgePath(x1, y1, x2, y2) {
  if (x1 === x2) return `M ${x1} ${y1} L ${x2} ${y2}`;

  const direction = x2 >= x1 ? 1 : -1;
  const pull = Math.max(34, Math.abs(x2 - x1) * 0.45);

  return `M ${x1} ${y1} C ${x1 + pull * direction} ${y1} ${x2 - pull * direction} ${y2} ${x2} ${y2}`;
}

function getRelationStyle(type, sourceColor, targetColor) {
  const styles = {
    branch: {
      color: targetColor,
      dash: '6 6',
      width: 1.8,
      opacity: 0.5,
    },
    merge: {
      color: targetColor,
      dash: '',
      width: 2.4,
      opacity: 0.74,
    },
    rebase: {
      color: '#38bdf8',
      dash: '4 4',
      width: 2.1,
      opacity: 0.82,
    },
    'cherry-pick': {
      color: '#f59e0b',
      dash: '3 5',
      width: 2,
      opacity: 0.86,
    },
  };

  return styles[type] ?? {
    color: sourceColor,
    dash: '',
    width: 1.8,
    opacity: 0.6,
  };
}

export default function GitGraph({
  graphState,
  branches,
  activeBranch,
  selectedNode,
  onNodeSelect,
}) {
  const { nodes, edges } = graphState;
  const branchMap = Object.fromEntries(branches.map(branch => [branch.id, branch]));
  const branchRows = branches.map(branch => ({
    branch,
    nodes: nodes
      .filter(node => node.branchId === branch.id)
      .sort((left, right) => left.x - right.x),
  }));

  const maxX = nodes.reduce((max, node) => Math.max(max, node.x), 0);
  const maxY = branches.reduce((max, branch) => Math.max(max, branch.y), 0);
  const svgWidth = Math.max(maxX + SVG_PADDING.left + SVG_PADDING.right, 760);
  const svgHeight = Math.max(maxY + SVG_PADDING.top + SVG_PADDING.bottom, 360);

  function nodeX(node) {
    return node.x + SVG_PADDING.left;
  }

  function nodeY(node) {
    const branch = branchMap[node.branchId];
    return branch ? branch.y + SVG_PADDING.top : SVG_PADDING.top;
  }

  function toggleNode(nodeId) {
    onNodeSelect(nodeId === selectedNode ? null : nodeId);
  }

  const timelineSegments = branchRows.flatMap(({ branch, nodes: branchNodes }) =>
    branchNodes.slice(1).map((node, index) => ({
      id: `${branch.id}-${branchNodes[index].id}-${node.id}`,
      branch,
      from: branchNodes[index],
      to: node,
    }))
  );

  return (
    <section className="history-graph">
      <header className="history-graph__bar">
        <span className="history-graph__signal" />
        Historico Git
      </header>

      <div className="history-graph__viewport">
        <svg
          className="history-graph__svg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMinYMin meet"
          role="img"
          aria-label="Grafo interativo de branches Git"
        >
          <defs>
            <filter id="commit-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g className="history-graph__lanes">
            {branches.map(branch => {
              const y = branch.y + SVG_PADDING.top;
              const isCurrent = branch.id === activeBranch;

              return (
                <g key={branch.id} className="branch-lane">
                  {isCurrent && (
                    <rect
                      x="12"
                      y={y - 20}
                      width={svgWidth - 24}
                      height="40"
                      rx="8"
                      fill={branch.color}
                      fillOpacity="0.08"
                    />
                  )}

                  <line
                    x1={SVG_PADDING.left - 4}
                    y1={y}
                    x2={svgWidth - 36}
                    y2={y}
                    stroke={branch.color}
                    strokeWidth={isCurrent ? 2 : 1.2}
                    strokeOpacity={isCurrent ? 0.28 : 0.14}
                  />

                  <circle
                    cx={SVG_PADDING.left - 12}
                    cy={y}
                    r="4"
                    fill={branch.color}
                    opacity={isCurrent ? 1 : 0.42}
                  />

                  <text
                    x={SVG_PADDING.left - 22}
                    y={y + 4}
                    textAnchor="end"
                    fill={branch.color}
                    className="branch-lane__label"
                    opacity={isCurrent ? 1 : 0.62}
                  >
                    {branch.label}
                  </text>
                </g>
              );
            })}
          </g>

          <g className="history-graph__timelines">
            {timelineSegments.map(segment => (
              <path
                key={segment.id}
                d={edgePath(
                  nodeX(segment.from),
                  nodeY(segment.from),
                  nodeX(segment.to),
                  nodeY(segment.to)
                )}
                stroke={segment.branch.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeOpacity="0.86"
                fill="none"
              />
            ))}
          </g>

          <g className="history-graph__relations">
            {edges.map((edge, index) => {
              const source = nodes.find(node => node.id === edge.from);
              const target = nodes.find(node => node.id === edge.to);

              if (!source || !target) return null;

              const sourceBranch = branchMap[source.branchId];
              const targetBranch = branchMap[target.branchId];

              if (!sourceBranch || !targetBranch) return null;

              const relation = getRelationStyle(edge.type, sourceBranch.color, targetBranch.color);

              return (
                <path
                  key={edge.id ?? `${edge.type}-${edge.from}-${edge.to}-${index}`}
                  className={`history-graph__relation history-graph__relation--${edge.type}`}
                  d={edgePath(nodeX(source), nodeY(source), nodeX(target), nodeY(target))}
                  stroke={relation.color}
                  strokeWidth={relation.width}
                  strokeOpacity={relation.opacity}
                  strokeDasharray={relation.dash}
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}
          </g>

          <g className="history-graph__nodes">
            {nodes.map(node => {
              const branch = branchMap[node.branchId];
              if (!branch) return null;

              const x = nodeX(node);
              const y = nodeY(node);
              const isSelected = node.id === selectedNode;
              const isCurrentBranch = node.branchId === activeBranch;
              const labelWidth = node.label ? Math.max(36, node.label.length * 7 + 16) : 0;

              return (
                <g
                  key={node.id}
                  className={`commit-node ${isSelected ? 'commit-node--selected' : ''}`}
                  role="button"
                  tabIndex="0"
                  aria-label={`Commit ${node.label || node.id} na branch ${branch.label}`}
                  onClick={() => toggleNode(node.id)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleNode(node.id);
                    }
                  }}
                >
                  <title>{`${branch.label} / ${node.label || node.id}`}</title>

                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r={NODE_HALO + 5}
                      fill={branch.color}
                      fillOpacity="0.16"
                    />
                  )}

                  <circle
                    cx={x}
                    cy={y}
                    r={NODE_HALO}
                    fill={branch.color}
                    fillOpacity={isCurrentBranch ? 0.18 : 0.1}
                  />

                  {node.type === 'merge' ? (
                    <polygon
                      points={`${x},${y - 8} ${x + 8},${y} ${x},${y + 8} ${x - 8},${y}`}
                      fill={branch.color}
                      opacity={isCurrentBranch ? 1 : 0.76}
                      filter={isCurrentBranch ? 'url(#commit-glow)' : undefined}
                    />
                  ) : (
                    <circle
                      cx={x}
                      cy={y}
                      r={NODE_RADIUS}
                      fill={branch.color}
                      opacity={isCurrentBranch ? 1 : 0.78}
                      filter={isCurrentBranch ? 'url(#commit-glow)' : undefined}
                    />
                  )}

                  {node.rebased && (
                    <circle
                      cx={x}
                      cy={y}
                      r={NODE_RADIUS + 5}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.4"
                      strokeDasharray="3 3"
                    />
                  )}

                  {node.label && (
                    <g className="commit-node__label">
                      <rect
                        x={x - labelWidth / 2}
                        y={y - LABEL_OFFSET - 15}
                        width={labelWidth}
                        height="18"
                        rx="6"
                        fill="#101016"
                        stroke={branch.color}
                        strokeOpacity="0.32"
                      />
                      <text
                        x={x}
                        y={y - LABEL_OFFSET - 2}
                        textAnchor="middle"
                        fill={branch.color}
                      >
                        {node.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}
