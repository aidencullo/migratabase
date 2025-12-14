import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Migratabase',
  description: 'Search for migrants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
