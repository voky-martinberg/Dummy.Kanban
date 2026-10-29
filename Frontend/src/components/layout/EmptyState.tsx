import './EmptyState.css'

/** Visas tills tavlan har minst en kolumn och en swimlane. */
export function EmptyState({ hasColumns, hasLanes, onNewColumn, onNewLane }: {
  hasColumns: boolean
  hasLanes: boolean
  onNewColumn: () => void
  onNewLane: () => void
}) {
  return (
    <div className="empty">
      <h2>Kom igång</h2>
      <p>
        En tavla består av <strong>kolumner</strong> (t.ex. Backlog, Pågår, Klart) och <strong>swimlanes</strong>
        {' '}(rader, t.ex. per team eller område). Skapa minst en av varje så kan du börja lägga till uppgifter.
      </p>
      <div className="empty-actions">
        {!hasColumns && <button className="btn btn-primary" onClick={onNewColumn}>+ Första kolumnen</button>}
        {!hasLanes && <button className="btn btn-primary" onClick={onNewLane}>+ Första swimlanen</button>}
      </div>
    </div>
  )
}
