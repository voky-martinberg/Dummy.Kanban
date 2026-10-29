import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Board, Task, TaskFields } from '../api/types'
import { cellTasks, moveTaskLocally } from '../lib/board'
import { errorMessage } from '../lib/errors'
import { inOrder, sameOrder, sectionsOf, withSections } from '../lib/sections'
import type { SectionKind } from '../lib/sections'

const sectionApi = (kind: SectionKind) => (kind === 'column' ? api.columns : api.swimlanes)

/**
 * Tavlans data och alla ändringar av den.
 *
 * Flyttar (uppgifter, ordning på sektioner) visas direkt och läser bara om tavlan om
 * sparningen misslyckas. Övriga ändringar sparas först och läser sedan om tavlan.
 */
export function useBoard() {
  const [board, setBoard] = useState<Board | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setBoard(await api.getBoard())
      setError(null)
    } catch (e) {
      setError(errorMessage(e))
    }
  }, [])

  useEffect(() => {
    api.getBoard()
      .then(setBoard)
      .catch((e) => setError(errorMessage(e)))
  }, [])

  /** Spara och läs sedan om tavlan, oavsett utfall. */
  const run = async (save: () => Promise<unknown>) => {
    try {
      await save()
    } catch (e) {
      setError(errorMessage(e))
    }
    await reload()
  }

  /** Visa `next` direkt; läs om från servern bara om sparningen misslyckas. */
  const optimistic = async (next: Board, save: () => Promise<unknown>) => {
    setBoard(next)
    try {
      await save()
    } catch (e) {
      setError(errorMessage(e))
      await reload()
    }
  }

  // ---- Kolumner och swimlanes ----

  const createSection = (kind: SectionKind, name: string) => run(() => sectionApi(kind).create(name))
  const renameSection = (kind: SectionKind, id: number, name: string) => run(() => sectionApi(kind).rename(id, name))
  const deleteSection = (kind: SectionKind, id: number) => run(() => sectionApi(kind).remove(id))

  /** Ny ordning, som lista med alla sektionens id:n. */
  const reorderSections = (kind: SectionKind, ids: number[]) => {
    if (!board) return
    const sections = sectionsOf(board, kind)
    if (sameOrder(sections, ids)) return
    const next = inOrder(sections, ids).map((s, i) => ({ ...s, position: i }))
    void optimistic(withSections(board, kind, next), () => sectionApi(kind).reorder(ids))
  }

  /** Flytta ett steg bakåt (-1) eller framåt (1). */
  const stepSection = (kind: SectionKind, id: number, dir: -1 | 1) => {
    if (!board) return
    const ids = sectionsOf(board, kind).map((s) => s.id)
    const from = ids.indexOf(id)
    const to = from + dir
    if (from === -1 || to < 0 || to >= ids.length) return
    ;[ids[from], ids[to]] = [ids[to], ids[from]]
    reorderSections(kind, ids)
  }

  // ---- Uppgifter ----

  const createTask = (fields: TaskFields) => run(() => api.tasks.create(fields))
  const deleteTask = (id: number) => run(() => api.tasks.remove(id))

  /** Spara titel/beskrivning. Byter den cell läggs den sist i den nya cellen. */
  const updateTask = (task: Task, fields: TaskFields) =>
    run(async () => {
      await api.tasks.update(task.id, fields.title, fields.description)
      if (task.columnId !== fields.columnId || task.swimlaneId !== fields.swimlaneId) {
        const position = cellTasks(board?.tasks ?? [], fields.columnId, fields.swimlaneId).length
        await api.tasks.move(task.id, fields.columnId, fields.swimlaneId, position)
      }
    })

  /** Flytta till cell och plats (`index` räknat bland cellens övriga uppgifter). */
  const moveTask = (id: number, columnId: number, swimlaneId: number, index: number) => {
    const task = board?.tasks.find((t) => t.id === id)
    if (!board || !task) return
    if (task.columnId === columnId && task.swimlaneId === swimlaneId && task.position === index) return
    void optimistic(
      { ...board, tasks: moveTaskLocally(board.tasks, id, columnId, swimlaneId, index) },
      () => api.tasks.move(id, columnId, swimlaneId, index),
    )
  }

  return {
    board,
    error,
    clearError: () => setError(null),
    actions: {
      createSection,
      renameSection,
      deleteSection,
      reorderSections,
      stepSection,
      createTask,
      updateTask,
      deleteTask,
      moveTask,
    },
  }
}

export type BoardActions = ReturnType<typeof useBoard>['actions']
