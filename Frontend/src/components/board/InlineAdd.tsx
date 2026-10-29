import { useState } from 'react'
import './InlineAdd.css'

/** Knapp som blir ett textfält; Enter lägger till och håller fältet öppet för nästa. */
export function InlineAdd({ label, placeholder, onAdd }: {
  label: string
  placeholder: string
  onAdd: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  if (!open) {
    return (
      <button className="add-button" onClick={() => setOpen(true)}>
        {label}
      </button>
    )
  }

  const close = () => {
    setOpen(false)
    setValue('')
  }

  return (
    <input
      className="inline-input"
      autoFocus
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={close}
      onKeyDown={(e) => {
        if (e.key === 'Escape') close()
        if (e.key === 'Enter' && value.trim()) {
          onAdd(value.trim())
          setValue('')
        }
      }}
    />
  )
}
