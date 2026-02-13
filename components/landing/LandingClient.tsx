"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { getLangFromSearchParams, type Lang } from '@/lib/copy'
import { LandingNav } from './LandingNav'
import { Hero } from './Hero'
import { Problem } from './Problem'
import { HowItWorks } from './HowItWorks'
import { Features } from './Features'
import { ProductTour } from './ProductTour'
import { Trust } from './Trust'
import { Pricing } from './Pricing'
import { FAQ } from './FAQ'
import { FinalCTA } from './FinalCTA'
import { Footer } from './Footer'

function LandingContent() {
  const searchParams = useSearchParams()
  const lang: Lang = getLangFromSearchParams({
    lang: searchParams.get('lang') ?? undefined,
  })

  return (
    <>
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
    </>
  )
}

export function LandingClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LandingContent />
    </Suspense>
  )
}
