import type { ReactNode } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import './Modal.css'

/** Formulär i en modal; stängs med Escape eller klick utanför. */
export function Modal({ title, onClose, onSubmit, children }: {
  title: string
  /** Bör vara stabil (useCallback), annars kopplas Escape-lyssnaren om vid varje rendering. */
  onClose: () => void
  onSubmit: () => void
  children: ReactNode
}) {
  useDismiss(onClose)

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="dialog"
        role="dialog"
        aria-label={title}
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <h2>{title}</h2>
        {children}
      </form>
    </div>
  )
}
