import { LandingNav } from '@/components/landing/LandingNav'
import { Hero } from '@/components/landing/Hero'
import { Problem } from '@/components/landing/Problem'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Features } from '@/components/landing/Features'
import { ProductTour } from '@/components/landing/ProductTour'
import { Trust } from '@/components/landing/Trust'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'
import { getLangFromSearchParams, type Lang } from '@/lib/copy'
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

export default function HomePage({
  searchParams = {},
}: {
  searchParams?: { lang?: string | string[] }
}) {
  const lang: Lang = getLangFromSearchParams(searchParams)

  return (
    <main className="min-h-screen">
      <LandingNav lang={lang} />
      <Hero lang={lang} />
      <Problem lang={lang} />
      <HowItWorks lang={lang} />
      <Features lang={lang} />
      <ProductTour lang={lang} />
      <Trust lang={lang} />
      <Pricing lang={lang} />
      <FAQ lang={lang} />
      <FinalCTA lang={lang} />
      <Footer lang={lang} />
    </main>
  )
}
