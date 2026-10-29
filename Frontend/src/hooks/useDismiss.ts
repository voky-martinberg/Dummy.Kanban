import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Anropar `onDismiss` vid Escape, och vid klick utanför `ref` om en sådan anges.
 * Används av modaler och menyer.
 */
export function useDismiss(onDismiss: () => void, { enabled = true, ref }: { enabled?: boolean; ref?: RefObject<HTMLElement | null> } = {}) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDismiss()
    const onDown = (e: MouseEvent) => {
      if (ref?.current && !ref.current.contains(e.target as Node)) onDismiss()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [enabled, onDismiss, ref])
}
