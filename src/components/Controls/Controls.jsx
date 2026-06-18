import './Controls.css';

export default function Controls({
  branches,
  activeBranch,
  targetBranch,
  onBranchChange,
  onTargetChange,
  onCommit,
  onMerge,
  onRebase,
  onCherryPick,
  onReset,
}) {
  const otherBranches = branches.filter(b => b.id !== activeBranch);

  return (
    <div className="controls">
      <div className="controls_actions">
        <span className="controls_row-label">ações</span>
        <button className="controls_btn controls_btn--primary" onClick={onCommit}>
          Commit
        </button>
        <div className="controls_separator" />
        {/* <select
          className="controls_select"
          value={targetBranch}
          onChange={e => onTargetChange(e.target.value)}
        >
          {otherBranches.map(b => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select> */}
        <button className="controls_btn" onClick={onMerge}>Merge</button>
        <button className="controls_btn" onClick={onRebase}>Rebase</button>
        <button className="controls_btn" onClick={onCherryPick}>Cherry-pick</button>
        <div className="controls_separator" />
        <button className="controls_btn controls_btn--danger" onClick={onReset}>Reset</button>
      </div>

      <div className="controls_branches">
        <span className="controls_row-label">branch</span>
        {branches.map(b => (
          <button
            key={b.id}
            className={`controls_branch ${activeBranch === b.id ? 'controls_branch--active' : ''}`}
            style={activeBranch === b.id ? { '--branch-color': b.color } : {}}
            onClick={() => onBranchChange(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
