import type { Task } from '../api/types'

const inCell = (t: Task, columnId: number, swimlaneId: number) =>
  t.columnId === columnId && t.swimlaneId === swimlaneId

/** Uppgifterna i en cell, sorterade. */
export function cellTasks(tasks: Task[], columnId: number, swimlaneId: number): Task[] {
  return tasks.filter((t) => inCell(t, columnId, swimlaneId)).sort((a, b) => a.position - b.position)
}

/**
 * Speglar backendens flyttlogik lokalt så att tavlan uppdateras direkt vid drop
 * (optimistisk uppdatering). `index` räknas bland cellens övriga uppgifter.
 */
export function moveTaskLocally(
  tasks: Task[],
  taskId: number,
  columnId: number,
  swimlaneId: number,
  index: number,
): Task[] {
  const task = tasks.find((t) => t.id === taskId)
  if (!task) return tasks
  const others = tasks.filter((t) => t.id !== taskId)

  const updated = new Map<number, Task>()
  const target = cellTasks(others, columnId, swimlaneId)
  target.splice(Math.max(0, Math.min(index, target.length)), 0, { ...task, columnId, swimlaneId })
  target.forEach((t, i) => updated.set(t.id, { ...t, position: i }))

  if (!inCell(task, columnId, swimlaneId)) {
    cellTasks(others, task.columnId, task.swimlaneId).forEach((t, i) => updated.set(t.id, { ...t, position: i }))
  }

  return [...others.filter((t) => !updated.has(t.id)), ...updated.values()]
}
