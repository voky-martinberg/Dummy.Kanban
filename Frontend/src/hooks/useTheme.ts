import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

/**
 * Ljust eller mörkt tema. Startvärdet sätts redan i index.html (sparat val, annars
 * systemets inställning) så att sidan inte blinkar; här läses det bara av och ändras.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Lagring kan vara avstängd; temat gäller då bara tills sidan laddas om.
    }
  }, [theme])

  return [theme, setTheme] as const
}
