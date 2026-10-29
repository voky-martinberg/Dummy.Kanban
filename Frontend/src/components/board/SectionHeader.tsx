import { useRef, useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import type { Section } from '../../api/types'
import type { BoardActions } from '../../hooks/useBoard'
import { columnColor } from '../../lib/colors'
import type { SectionKind } from '../../lib/sections'
import { HeaderMenu } from './HeaderMenu'
import './SectionHeader.css'

/**
 * Rubrik för en kolumn eller swimlane: dra för att flytta, dubbelklicka för att byta namn,
 * ⋯-meny för flytta/byt namn/ta bort. `children` visas efter namnet (t.ex. antal uppgifter).
 *
 * Dragningen stängs av medan namnet redigeras, så att textmarkering i fältet fungerar.
 */
export function SectionHeader({ kind, section, canMove, isDragged, dragProps, actions, children }: {
  kind: SectionKind
  section: Section
  canMove: [back: boolean, forward: boolean]
  isDragged: boolean
  dragProps: HTMLAttributes<HTMLElement>
  actions: BoardActions
  children?: ReactNode
}) {
  const [editing, setEditing] = useState(false)

  return (
    <div
      className={`${kind === 'column' ? 'column-header' : 'lane-header'}${isDragged ? ' reorder-source' : ''}`}
      style={kind === 'column' ? columnColor(section.id) : undefined}
      data-section-kind={kind}
      data-section-id={section.id}
    >
      {editing ? (
        <RenameInput
          name={section.name}
          onDone={(name) => {
            setEditing(false)
            if (name && name !== section.name) void actions.renameSection(kind, section.id, name)
          }}
        />
      ) : (
        <div className="header" draggable {...dragProps}>
          <span className="grip" aria-hidden="true">⠿</span>
          <span className="header-name" title="Dra för att flytta, dubbelklicka för att byta namn" onDoubleClick={() => setEditing(true)}>
            {section.name}
          </span>
          {children}
          <HeaderMenu
            kind={kind}
            name={section.name}
            canMove={canMove}
            onStep={(dir) => actions.stepSection(kind, section.id, dir)}
            onRename={() => setEditing(true)}
            onDelete={() => void actions.deleteSection(kind, section.id)}
          />
        </div>
      )}
    </div>
  )
}

/** Enter/klick utanför sparar, Escape avbryter (`onDone` får då null). */
function RenameInput({ name, onDone }: { name: string; onDone: (name: string | null) => void }) {
  const [value, setValue] = useState(name)
  // Fältet tas bort när vi är klara, vilket kan ge en blur efter Enter/Escape: avsluta bara en gång.
  const done = useRef(false)
  const finish = (result: string | null) => {
    if (done.current) return
    done.current = true
    onDone(result)
  }

  return (
    <input
      className="inline-input"
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => finish(value.trim())}
      onKeyDown={(e) => {
        if (e.key === 'Enter') finish(value.trim())
        if (e.key === 'Escape') finish(null)
      }}
    />
  )
}
