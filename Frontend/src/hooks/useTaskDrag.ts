import { useRef, useState } from 'react'
import type { DragEvent } from 'react'

type DropTarget = { columnId: number; swimlaneId: number; index: number }

/**
 * Dra uppgifter mellan celler. `cardProps` sprids på kortet och `cellProps` på cellen;
 * `dropIndexIn` ger var markören ska visas i en cell.
 */
export function useTaskDrag(onMove: (taskId: number, columnId: number, swimlaneId: number, index: number) => void) {
  // Ref för att handlers ska se värdet direkt, state för att rita om kortet som dras.
  const draggedId = useRef<number | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  const end = () => {
    draggedId.current = null
    setDraggingId(null)
    setDropTarget(null)
  }

  /** Plats i cellen, räknat bland kort som inte är det som dras. */
  const indexAt = (e: DragEvent<HTMLElement>) => {
    const cards = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-task-id]'))
      .filter((el) => Number(el.dataset.taskId) !== draggedId.current)
    const index = cards.findIndex((el) => {
      const r = el.getBoundingClientRect()
      return e.clientY < r.top + r.height / 2
    })
    return index === -1 ? cards.length : index
  }

  const cardProps = (taskId: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      e.dataTransfer.setData('text/plain', String(taskId))
      e.dataTransfer.effectAllowed = 'move'
      draggedId.current = taskId
      setDraggingId(taskId)
    },
    onDragEnd: end,
  })

  // Utan uppgiftsdragning gör handlers ingenting, så att eventet bubblar vidare till tavlan.
  const cellProps = (columnId: number, swimlaneId: number) => ({
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (draggedId.current === null) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      const index = indexAt(e)
      if (dropTarget?.columnId !== columnId || dropTarget.swimlaneId !== swimlaneId || dropTarget.index !== index) {
        setDropTarget({ columnId, swimlaneId, index })
      }
    },
    onDragLeave: (e: DragEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null)
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      const id = draggedId.current
      if (id === null) return
      e.preventDefault()
      const index = indexAt(e)
      end()
      onMove(id, columnId, swimlaneId, index)
    },
  })

  const dropIndexIn = (columnId: number, swimlaneId: number) =>
    dropTarget?.columnId === columnId && dropTarget.swimlaneId === swimlaneId ? dropTarget.index : null

  return { draggingId, cardProps, cellProps, dropIndexIn }
}
