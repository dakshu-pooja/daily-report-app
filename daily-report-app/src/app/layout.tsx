import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Daily Report System',
  description: 'Professional Employee Daily Reporting System',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
