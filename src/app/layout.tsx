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
  title: 'Iconish - SVG icon alignment and minification',
  description: 'Align and minify SVG icons for the web',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.className} suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#ffffff" />
        <ThemeScript />
      </head>
      <body>{props.children}</body>
    </html>
  )
}
