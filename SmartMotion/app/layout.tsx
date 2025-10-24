import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartMotion - Personalized Fitness Education',
  description: 'Empower your fitness journey with personalized education and habit formation',
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
