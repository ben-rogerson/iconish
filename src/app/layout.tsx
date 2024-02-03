import type { Metadata } from 'next'
import { ThemeScript } from 'next-app-theme/theme-script'

import './globals.css'

export const metadata: Metadata = {
  title: 'Iconish',
  description: 'Align and optimize SVG icons for the web',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{props.children}</body>
    </html>
  )
}
