import './GitGraph.css';

const NODE_RADIUS = 6;
const RING_RADIUS = 11;
const LABEL_OFFSET_Y = 16;
const BRANCH_LABEL_X = 80;
const SVG_PADDING = { top: 20, right: 60, bottom: 20, left: 100 };

function edgePath(x1, y1, x2, y2) {
  if (x1 === x2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${midX} ${y1} ${midX} ${y2} ${x2} ${y2}`;
}

export default function GitGraph({ graphState, branches, activeBranch, selectedNode, onNodeSelect }) {
  const { nodes, edges } = graphState;

  const branchMap = Object.fromEntries(branches.map(b => [b.id, b]));

  const maxX = nodes.reduce((m, n) => Math.max(m, n.x), 0);
  const svgWidth = Math.max(maxX + SVG_PADDING.right + SVG_PADDING.left, 500);
  const maxY = branches.reduce((m, b) => Math.max(m, b.y), 0);
  const svgHeight = maxY + SVG_PADDING.top + SVG_PADDING.bottom;

  function nodeX(n) { return n.x + SVG_PADDING.left; }
  function nodeY(n) {
    const branch = branchMap[n.branchId];
    return branch ? branch.y + SVG_PADDING.top : SVG_PADDING.top;
  }

  return (
    <div className="gitgraph">
      <div className="gitgraph_tag">
        <span className="gitgraph_dot" />
        Graph
      </div>
      <div className="gitgraph_canvas">
        <svg
          className="gitgraph_svg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMinYMid meet"
        >
          {/* Branch lane lines */}
          {branches.map(b => (
            <g key={b.id}>
              <line
                x1={BRANCH_LABEL_X}
                y1={b.y + SVG_PADDING.top}
                x2={svgWidth - SVG_PADDING.right / 2}
                y2={b.y + SVG_PADDING.top}
                stroke={b.color}
                strokeWidth={1.5}
                strokeOpacity={b.id === activeBranch ? 0.6 : 0.25}
              />
              <text
                x={BRANCH_LABEL_X - 8}
                y={b.y + SVG_PADDING.top + 4}
                textAnchor="end"
                fill={b.color}
                fontSize={10}
                fontFamily="var(--font-mono)"
                opacity={b.id === activeBranch ? 1 : 0.6}
              >
                {b.label}
              </text>
            </g>
          ))}

          {/* Edges */}
          {edges.map((e, i) => {
            const src = nodes.find(n => n.id === e.from);
            const tgt = nodes.find(n => n.id === e.to);
            if (!src || !tgt) return null;
            const srcBranch = branchMap[src.branchId];
            const tgtBranch = branchMap[tgt.branchId];
            if (!srcBranch || !tgtBranch) return null;
            const color = e.type === 'cherry-pick'
              ? '#f97316'
              : srcBranch.color;
            return (
              <path
                key={i}
                d={edgePath(nodeX(src), nodeY(src), nodeX(tgt), nodeY(tgt))}
                stroke={color}
                strokeWidth={1.5}
                fill="none"
                strokeOpacity={0.55}
                strokeDasharray={e.type === 'cherry-pick' ? '4 3' : e.type === 'rebase' ? '3 2' : undefined}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(n => {
            const branch = branchMap[n.branchId];
            if (!branch) return null;
            const x = nodeX(n);
            const y = nodeY(n);
            const isSelected = n.id === selectedNode;
            const isActive = n.branchId === activeBranch;
            return (
              <g
                key={n.id}
                className="gitgraph_node"
                onClick={() => onNodeSelect(n.id === selectedNode ? null : n.id)}
                style={{ cursor: 'pointer' }}
              >
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={RING_RADIUS + 3}
                    fill={branch.color}
                    fillOpacity={0.2}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={RING_RADIUS}
                  fill={branch.color}
                  fillOpacity={isActive ? 0.15 : 0.08}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={NODE_RADIUS}
                  fill={branch.color}
                  fillOpacity={isActive ? 1 : 0.7}
                  stroke={isSelected ? '#fff' : 'none'}
                  strokeWidth={isSelected ? 1.5 : 0}
                />
                {n.label && (
                  <text
                    x={x}
                    y={y - LABEL_OFFSET_Y}
                    textAnchor="middle"
                    fill={branch.color}
                    fontSize={9}
                    fontFamily="var(--font-mono)"
                    opacity={0.85}
                  >
                    {n.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
