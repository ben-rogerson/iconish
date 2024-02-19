import type { Metadata } from 'next'
import { ThemeScript } from 'next-app-theme/theme-script'
import { Chivo_Mono } from 'next/font/google'

import './globals.css'

// If loading a variable font, you don't need to specify the font weight
const font = Chivo_Mono({
  weight: ['500', '300'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Iconish',
  description: 'Align and minify SVG icons for the web',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.className} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{props.children}</body>
    </html>
  )
}
