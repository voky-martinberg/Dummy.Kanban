import { Fragment } from 'react'
import type { Board as BoardData, Task } from '../../api/types'
import type { BoardActions } from '../../hooks/useBoard'
import { useReorderDrag } from '../../hooks/useReorderDrag'
import { useTaskDrag } from '../../hooks/useTaskDrag'
import { cellTasks } from '../../lib/board'
import { BoardCell } from './BoardCell'
import { SectionHeader } from './SectionHeader'
import './Board.css'

/**
 * Tavlan som ett grid: första raden är kolumnrubriker, därefter en rad per swimlane
 * med swimlanens rubrik först och sedan en cell per kolumn.
 */
export function Board({ board, actions, onOpenTask }: {
  board: BoardData
  actions: BoardActions
  onOpenTask: (task: Task) => void
}) {
  const taskDrag = useTaskDrag(actions.moveTask)
  const reorder = useReorderDrag(board, actions.reorderSections)
  // Under dragning av en rubrik är detta den förhandsvisade ordningen.
  const { columns, swimlanes } = reorder

  return (
    <div className="board-scroll">
      <div
        className={`board${reorder.active ? ' board-reordering' : ''}`}
        style={{ gridTemplateColumns: `170px repeat(${columns.length}, minmax(250px, 1fr))` }}
        {...reorder.boardProps}
      >
        <div />
        {columns.map((column, i) => (
          <SectionHeader
            key={column.id}
            kind="column"
            section={column}
            canMove={[i > 0, i < columns.length - 1]}
            isDragged={reorder.isDragged('column', column.id)}
            dragProps={reorder.dragProps('column', column.id)}
            actions={actions}
          >
            <span className="count">{board.tasks.filter((t) => t.columnId === column.id).length}</span>
          </SectionHeader>
        ))}

        {swimlanes.map((lane, i) => (
          <Fragment key={lane.id}>
            <SectionHeader
              kind="lane"
              section={lane}
              canMove={[i > 0, i < swimlanes.length - 1]}
              isDragged={reorder.isDragged('lane', lane.id)}
              dragProps={reorder.dragProps('lane', lane.id)}
              actions={actions}
            />
            {columns.map((column) => (
              <BoardCell
                key={column.id}
                columnId={column.id}
                tasks={cellTasks(board.tasks, column.id, lane.id)}
                isDragged={reorder.isDragged('column', column.id) || reorder.isDragged('lane', lane.id)}
                draggingTaskId={taskDrag.draggingId}
                cardDragProps={taskDrag.cardProps}
                dropIndex={taskDrag.dropIndexIn(column.id, lane.id)}
                dropProps={taskDrag.cellProps(column.id, lane.id)}
                onOpenTask={onOpenTask}
                onAdd={(title) => actions.createTask({ title, description: null, columnId: column.id, swimlaneId: lane.id })}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
