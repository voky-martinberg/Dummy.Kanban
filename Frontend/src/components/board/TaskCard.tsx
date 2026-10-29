import type { HTMLAttributes } from 'react'
import type { Task } from '../../api/types'
import './TaskCard.css'

export function TaskCard({ task, dragging, dragProps, onOpen }: {
  task: Task
  dragging: boolean
  dragProps: HTMLAttributes<HTMLElement>
  onOpen: () => void
}) {
  return (
    <article
      className={`card${dragging ? ' card-dragging' : ''}`}
      data-task-id={task.id}
      {...dragProps}
      onClick={onOpen}
    >
      <div className="card-title">{task.title}</div>
      {task.description && <div className="card-description">{task.description}</div>}
    </article>
  )
}
