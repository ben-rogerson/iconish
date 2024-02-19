'use client'

import { useTheme } from 'next-app-theme/use-theme'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggler() {
  const { theme, toggleTheme } = useTheme()
  const icon = theme === 'dark' ? <Sun /> : <Moon />

  return (
    <button type="button" onClick={toggleTheme}>
      {icon}
    </button>
  )
}
