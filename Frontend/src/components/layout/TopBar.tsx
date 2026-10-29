import './TopBar.css'

/** Logga och knappanelen uppe till höger. */
export function TopBar({ canCreateTask, onNewColumn, onNewLane, onNewTask }: {
  canCreateTask: boolean
  onNewColumn: () => void
  onNewLane: () => void
  onNewTask: () => void
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <h1>Kanban</h1>
      </div>
      <div className="toolbar">
        <button className="btn" onClick={onNewColumn}>+ Kolumn</button>
        <button className="btn" onClick={onNewLane}>+ Swimlane</button>
        <button
          className="btn btn-primary"
          disabled={!canCreateTask}
          title={canCreateTask ? undefined : 'Skapa minst en kolumn och en swimlane först'}
          onClick={onNewTask}
        >
          + Uppgift
        </button>
      </div>
    </header>
  )
}
