import { useState } from 'react'
import { Modal } from './Modal'

/** Skapa en kolumn eller swimlane. */
export function NameDialog({ title, placeholder, onSave, onClose }: {
  title: string
  placeholder: string
  onSave: (name: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')

  return (
    <Modal title={title} onClose={onClose} onSubmit={() => name.trim() && onSave(name.trim())}>
      <label>
        Namn
        <input autoFocus placeholder={placeholder} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="dialog-actions">
        <span className="spacer" />
        <button type="button" className="btn btn-outline" onClick={onClose}>Avbryt</button>
        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>Skapa</button>
      </div>
    </Modal>
  )
}
