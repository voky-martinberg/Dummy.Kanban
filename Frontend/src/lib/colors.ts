import type { CSSProperties } from 'react'

const COLUMN_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#0ea5e9', '#ec4899', '#8b5cf6', '#14b8a6']

/**
 * Sätter CSS-variabeln `--col` som rubriker, celler och kort färgas med.
 * Knuten till kolumnens id så att färgen följer med när kolumnen flyttas.
 */
export const columnColor = (columnId: number) =>
  ({ '--col': COLUMN_COLORS[columnId % COLUMN_COLORS.length] }) as CSSProperties
