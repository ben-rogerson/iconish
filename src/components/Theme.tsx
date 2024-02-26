'use client'

import { useTheme } from 'next-app-theme/use-theme'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggler(props: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const icon = theme === 'dark' ? <Sun {...props} /> : <Moon {...props} />

  return (
    <button type="button" onClick={toggleTheme}>
      {icon}
    </button>
  )
}
