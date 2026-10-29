import { useState } from 'react'
import type { Column, Swimlane, Task, TaskFields } from '../../api/types'
import { Modal } from './Modal'

/** Skapa en uppgift (utan `task`) eller redigera, flytta och ta bort en befintlig. */
export function TaskDialog({ task, columns, swimlanes, onSave, onDelete, onClose }: {
  task?: Task
  columns: Column[]
  swimlanes: Swimlane[]
  onSave: (fields: TaskFields) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [columnId, setColumnId] = useState(task?.columnId ?? columns[0]?.id)
  const [swimlaneId, setSwimlaneId] = useState(task?.swimlaneId ?? swimlanes[0]?.id)
  const canSave = !!title.trim() && columnId !== undefined && swimlaneId !== undefined

  const submit = () => {
    if (!title.trim() || columnId === undefined || swimlaneId === undefined) return
    onSave({ title: title.trim(), description: description.trim() || null, columnId, swimlaneId })
  }

  return (
    <Modal title={task ? 'Redigera uppgift' : 'Ny uppgift'} onClose={onClose} onSubmit={submit}>
      <label>
        Titel
        <input autoFocus placeholder="Vad ska göras?" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Beskrivning
        <textarea rows={4} placeholder="Valfritt" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div className="dialog-row">
        <label>
          Kolumn
          <select value={columnId} onChange={(e) => setColumnId(Number(e.target.value))}>
            {columns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>
          Swimlane
          <select value={swimlaneId} onChange={(e) => setSwimlaneId(Number(e.target.value))}>
            {swimlanes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>
      <div className="dialog-actions">
        {onDelete && (
          <button type="button" className="btn btn-danger" onClick={() => confirm('Ta bort uppgiften?') && onDelete()}>
            Ta bort
          </button>
        )}
        <span className="spacer" />
        <button type="button" className="btn btn-outline" onClick={onClose}>Avbryt</button>
        <button type="submit" className="btn btn-primary" disabled={!canSave}>{task ? 'Spara' : 'Skapa'}</button>
      </div>
    </Modal>
  )
}
