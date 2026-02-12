"use client"

import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from './LanguageToggle'
import { copy, type Lang } from '@/lib/copy'

export function LandingNav({ lang }: { lang: Lang }) {
  const t = copy[lang]

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold font-heading text-navy">
              InvestiaFlow
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('product')}
              className="text-sm font-medium text-gray-text hover:text-navy transition-colors"
            >
              {t.nav.product}
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-gray-text hover:text-navy transition-colors"
            >
              {t.nav.howItWorks}
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-sm font-medium text-gray-text hover:text-navy transition-colors"
            >
              {t.nav.pricing}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-sm font-medium text-gray-text hover:text-navy transition-colors"
            >
              {t.nav.faq}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="w-20 h-8" />}>
              <LanguageToggle lang={lang} />
            </Suspense>
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://calendly.com/investiaflow/demo', '_blank')}
              >
                {t.nav.bookDemo}
              </Button>
              <Button
                size="sm"
                onClick={() => window.open('https://app.investiaflow.com/signup', '_blank')}
              >
                {t.nav.startFree}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
