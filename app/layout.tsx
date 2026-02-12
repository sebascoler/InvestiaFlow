import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({ 
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'InvestiaFlow — Fundraising, organized and automated',
  description: 'Move investors through stages. InvestiaFlow automatically shares the right documents at the right time—so you don\'t have to.',
  openGraph: {
    title: 'InvestiaFlow — Fundraising, organized and automated',
    description: 'Move investors through stages. InvestiaFlow automatically shares the right documents at the right time—so you don\'t have to.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvestiaFlow — Fundraising, organized and automated',
    description: 'Move investors through stages. InvestiaFlow automatically shares the right documents at the right time—so you don\'t have to.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
