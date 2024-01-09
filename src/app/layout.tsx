import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Iconish',
  description: '...',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="dark">{children}</body>
    </html>
  )
}
