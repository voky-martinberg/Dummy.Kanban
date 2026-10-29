import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import { SECTION_TEXT } from '../../lib/sections'
import type { SectionKind } from '../../lib/sections'
import './HeaderMenu.css'

/** ⋯-menyn på en kolumn-/swimlane-rubrik. */
export function HeaderMenu({ kind, name, canMove, onStep, onRename, onDelete }: {
  kind: SectionKind
  name: string
  canMove: [back: boolean, forward: boolean]
  onStep: (dir: -1 | 1) => void
  onRename: () => void
  onDelete: () => void
}) {
  // Menyn är fixed-positionerad under knappen så att tavlans scrollruta inte klipper den.
  const [position, setPosition] = useState<CSSProperties | null>(null)
  const open = position !== null
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setPosition(null), [])
  useDismiss(close, { enabled: open, ref })

  // Fixed-positionen följer inte med vid scroll, så stäng i stället.
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open, close])

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    if (open) return close()
    const r = e.currentTarget.getBoundingClientRect()
    setPosition({ top: r.bottom + 6, right: document.documentElement.clientWidth - r.right })
  }

  const text = SECTION_TEXT[kind]
  const pick = (action: () => void) => () => {
    close()
    action()
  }

  return (
    <div className={`menu${open ? ' menu-open' : ''}`} ref={ref}>
      <button
        className="menu-button"
        aria-label={`Alternativ för ${text.the} ${name}`}
        aria-expanded={open}
        onClick={toggle}
      >
        ⋯
      </button>
      {open && (
        <div className="menu-list" role="menu" style={position}>
          <button role="menuitem" disabled={!canMove[0]} onClick={pick(() => onStep(-1))}>{text.back}</button>
          <button role="menuitem" disabled={!canMove[1]} onClick={pick(() => onStep(1))}>{text.forward}</button>
          <hr />
          <button role="menuitem" onClick={pick(onRename)}>✎ Byt namn</button>
          <button
            role="menuitem"
            className="danger"
            onClick={pick(() => {
              if (confirm(`Ta bort ${text.the} "${name}"? Alla uppgifter i den tas också bort.`)) onDelete()
            })}
          >
            × Ta bort
          </button>
        </div>
      )}
    </div>
  )
}
