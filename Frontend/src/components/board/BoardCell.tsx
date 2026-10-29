import type { DragEvent, HTMLAttributes, ReactNode } from 'react'
import type { Task } from '../../api/types'
import { columnColor } from '../../lib/colors'
import { InlineAdd } from './InlineAdd'
import { TaskCard } from './TaskCard'
import './BoardCell.css'

/** En cell (kolumn × swimlane): uppgifterna, markören vid dragning och snabbtillägg. */
export function BoardCell({
  columnId,
  tasks,
  isDragged,
  draggingTaskId,
  cardDragProps,
  dropIndex,
  dropProps,
  onOpenTask,
  onAdd,
}: {
  columnId: number
  tasks: Task[]
  /** Cellens kolumn eller swimlane dras just nu. */
  isDragged: boolean
  draggingTaskId: number | null
  cardDragProps: (taskId: number) => HTMLAttributes<HTMLElement>
  /** Var markören ska visas, räknat bland kort som inte dras; null = ingen markör. */
  dropIndex: number | null
  dropProps: { [K in 'onDragOver' | 'onDragLeave' | 'onDrop']: (e: DragEvent<HTMLElement>) => void }
  onOpenTask: (task: Task) => void
  onAdd: (title: string) => void
}) {
  // Kortet som dras ligger kvar (tonat) på sin plats; markören placeras bland de övriga.
  const items: ReactNode[] = []
  let slot = 0
  for (const task of tasks) {
    const dragging = task.id === draggingTaskId
    if (!dragging) {
      if (dropIndex === slot) items.push(<DropMarker key="drop-marker" />)
      slot++
    }
    items.push(
      <TaskCard key={task.id} task={task} dragging={dragging} dragProps={cardDragProps(task.id)} onOpen={() => onOpenTask(task)} />,
    )
  }
  if (dropIndex !== null && dropIndex >= slot) items.push(<DropMarker key="drop-marker" />)

  return (
    <section
      className={`cell${dropIndex !== null ? ' cell-over' : ''}${isDragged ? ' reorder-source' : ''}`}
      style={columnColor(columnId)}
      {...dropProps}
    >
      {items}
      <InlineAdd label="+ Lägg till" placeholder="Vad ska göras?" onAdd={onAdd} />
    </section>
  )
}

const DropMarker = () => <div className="drop-marker" />
