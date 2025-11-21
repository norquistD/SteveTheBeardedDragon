import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Steve The Bearded Dragon',
  description: 'Rub my Belly',
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

