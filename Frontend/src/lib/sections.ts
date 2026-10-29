import type { Board, Section } from '../api/types'

/**
 * Kolumner och swimlanes beter sig likadant (skapa, byta namn, ta bort, sortera);
 * de skiljer sig bara i riktning. Den här modulen samlar det som skiljer.
 */
export type SectionKind = 'column' | 'lane'

export const SECTION_TEXT = {
  column: { the: 'kolumnen', newTitle: 'Ny kolumn', placeholder: 't.ex. Backlog', back: '← Flytta vänster', forward: '→ Flytta höger' },
  lane: { the: 'swimlanen', newTitle: 'Ny swimlane', placeholder: 't.ex. Frontend', back: '↑ Flytta upp', forward: '↓ Flytta ned' },
} satisfies Record<SectionKind, Record<string, string>>

export const sectionsOf = (board: Board, kind: SectionKind): Section[] =>
  kind === 'column' ? board.columns : board.swimlanes

export const withSections = (board: Board, kind: SectionKind, sections: Section[]): Board =>
  kind === 'column' ? { ...board, columns: sections } : { ...board, swimlanes: sections }

/** Lägg `items` i den ordning `ids` anger. */
export const inOrder = <T extends { id: number }>(items: T[], ids: number[]): T[] =>
  ids.map((id) => items.find((x) => x.id === id)).filter((x): x is T => x !== undefined)

export const sameOrder = (items: { id: number }[], ids: number[]) =>
  items.length === ids.length && items.every((x, i) => x.id === ids[i])
