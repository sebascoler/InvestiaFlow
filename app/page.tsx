import { LandingClient } from '@/components/landing/LandingClient'
import type { Metadata } from 'next'

// Necesario para static export (Hostinger): pre-render con lang por defecto
export const dynamic = 'force-static'
export const dynamicParams = false

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

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LandingClient />
    </main>
  )
}
