"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { getLangFromSearchParams, type Lang } from '@/lib/copy'
import { LandingNav } from './LandingNav'
import { Footer } from './Footer'

function LegalLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const lang: Lang = getLangFromSearchParams({
    lang: searchParams.get('lang') ?? undefined,
  })

  return (
    <>
      <LandingNav lang={lang} />
      <main className="min-h-screen pt-16">
        {children}
      </main>
      <Footer lang={lang} />
    </>
  )
}

export function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LegalLayoutInner>{children}</LegalLayoutInner>
    </Suspense>
  )
}
