import './Controls.css';

export default function Controls({
  branches,
  activeBranch,
  targetBranch,
  selectedCommit,
  onBranchChange,
  onTargetChange,
  onCommit,
  onMerge,
  onRebase,
  onCherryPick,
  onResetBranch,
  onResetAll,
}) {
  const targetOptions = branches.filter(branch => branch.id !== activeBranch);
  const canUseTarget = Boolean(targetBranch) && targetBranch !== activeBranch;
  const canCherryPick = Boolean(selectedCommit) && selectedCommit.branchId !== activeBranch;

  return (
    <aside className="workflow-console">
      <div className="workflow-console__row">
        <span className="workflow-console__caption">operacao</span>

        <button
          className="workflow-action workflow-action--commit"
          type="button"
          onClick={onCommit}
        >
          Commit
        </button>

        <label className="branch-target">
          <span className="branch-target__label">destino</span>
          <select
            className="branch-target__select"
            value={targetBranch}
            onChange={event => onTargetChange(event.target.value)}
          >
            {targetOptions.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.label}
              </option>
            ))}
          </select>
        </label>

        <button
          className="workflow-action"
          type="button"
          disabled={!canUseTarget}
          onClick={onMerge}
        >
          Merge
        </button>

        <button
          className="workflow-action"
          type="button"
          disabled={!canUseTarget}
          onClick={onRebase}
        >
          Rebase
        </button>

        <button
          className="workflow-action"
          type="button"
          disabled={!canCherryPick}
          onClick={onCherryPick}
          title={canCherryPick ? 'Replica o commit selecionado na branch ativa' : 'Selecione um commit de outra branch'}
        >
          Cherry-pick
        </button>

        <span className="workflow-console__divider" />

        <button
          className="workflow-action workflow-action--quiet"
          type="button"
          onClick={onResetBranch}
        >
          Remover ultimo
        </button>

        <button
          className="workflow-action workflow-action--danger"
          type="button"
          onClick={onResetAll}
        >
          Resetar tudo
        </button>
      </div>

      <div className="branch-picker" aria-label="Branches disponiveis">
        <span className="workflow-console__caption">branch</span>

        {branches.map(branch => (
          <button
            key={branch.id}
            className={`branch-chip ${activeBranch === branch.id ? 'branch-chip--current' : ''}`}
            style={{ '--chip-color': branch.color }}
            type="button"
            onClick={() => onBranchChange(branch.id)}
          >
            <span className="branch-chip__swatch" />
            <span className="branch-chip__name">{branch.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
