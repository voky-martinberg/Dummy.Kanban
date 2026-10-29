import { useState } from 'react'
import type { DragEvent } from 'react'
import type { Board } from '../api/types'
import { inOrder, sectionsOf } from '../lib/sections'
import type { SectionKind } from '../lib/sections'

/**
 * Ändra ordning på kolumner/swimlanes genom att dra i rubriken.
 *
 * Under dragningen ges sektionerna ut i förhandsvisad ordning (`columns`, `swimlanes`),
 * så att övriga glider undan direkt. Släpps den på tavlan anropas `onReorder`; avbryts
 * dragningen (Escape, släpp utanför) kastas förhandsvisningen.
 *
 * Rubrikerna måste ha `data-section-kind` och `data-section-id`, och `boardProps`
 * spridas på elementet som innehåller dem.
 */
export function useReorderDrag(board: Board, onReorder: (kind: SectionKind, ids: number[]) => void) {
  const [drag, setDrag] = useState<{ kind: SectionKind; id: number } | null>(null)
  const [preview, setPreview] = useState<number[] | null>(null)

  const end = () => {
    setDrag(null)
    setPreview(null)
  }

  const ordered = (kind: SectionKind) =>
    drag?.kind === kind && preview ? inOrder(sectionsOf(board, kind), preview) : sectionsOf(board, kind)

  const dragProps = (kind: SectionKind, id: number) => ({
    onDragStart: (e: DragEvent<HTMLElement>) => {
      e.dataTransfer.setData('text/plain', `${kind}:${id}`)
      e.dataTransfer.effectAllowed = 'move'
      // Hela rubrikrutan som dragbild, inte bara texten.
      const box = e.currentTarget.closest<HTMLElement>('[data-section-kind]')
      if (box) e.dataTransfer.setDragImage(box, 20, 20)
      setDrag({ kind, id })
    },
    // Körs även när dragningen avbryts.
    onDragEnd: end,
  })

  /**
   * Ny plats = antal övriga sektioner vars mittpunkt ligger före pekaren. Mittpunkterna
   * läses i nuvarande (förhandsvisade) ordning; vid en flytt glider grannen bort från
   * pekaren, så det fladdrar inte ens när rader är olika höga.
   */
  const onDragOver = (e: DragEvent<HTMLElement>) => {
    if (!drag) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    const others = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(`[data-section-kind="${drag.kind}"]`))
      .map((el) => ({ id: Number(el.dataset.sectionId), rect: el.getBoundingClientRect() }))
      .filter((s) => s.id !== drag.id)
    const pointer = drag.kind === 'column' ? e.clientX : e.clientY
    const index = others.filter(({ rect }) =>
      (drag.kind === 'column' ? rect.left + rect.width / 2 : rect.top + rect.height / 2) < pointer,
    ).length

    const ids = others.map((s) => s.id)
    ids.splice(index, 0, drag.id)
    const current = ordered(drag.kind).map((s) => s.id)
    if (ids.some((id, i) => current[i] !== id)) setPreview(ids)
  }

  const onDrop = (e: DragEvent<HTMLElement>) => {
    if (!drag) return
    e.preventDefault()
    const { kind } = drag
    const ids = preview
    end()
    if (ids) onReorder(kind, ids)
  }

  return {
    active: drag !== null,
    columns: ordered('column'),
    swimlanes: ordered('lane'),
    isDragged: (kind: SectionKind, id: number) => drag?.kind === kind && drag.id === id,
    dragProps,
    boardProps: { onDragOver, onDrop },
  }
}
