"use client"

import { Button } from '@/components/ui/button'
import { copy, type Lang } from '@/lib/copy'
import { motion } from 'framer-motion'

export function Hero({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--off-white)] to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-navy mb-6 leading-tight">
              {t.hero.headline}
            </h1>
            <p className="text-xl md:text-2xl text-gray-text mb-8 max-w-2xl mx-auto">
              {t.hero.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => window.open('https://app.investiaflow.com/signup', '_blank')}
                className="w-full sm:w-auto"
              >
                {t.hero.startFree}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open('https://calendly.com/investiaflow/demo', '_blank')}
                className="w-full sm:w-auto"
              >
                {t.hero.bookDemo}
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
            <div className="aspect-video rounded-xl overflow-hidden border border-gray-100">
              <picture>
                <source srcSet="/images/landing/hero/hero-preview.webp" type="image/webp" />
                <img
                  src="/images/landing/hero/hero-preview.png"
                  alt="InvestiaFlow CRM pipeline overview"
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <h3 className="font-semibold text-navy mb-1">Kanban investor pipeline</h3>
                <p className="text-sm text-gray-text">Visual tracking with drag & drop</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold text-navy mb-1">Stage-based permissions</h3>
                <p className="text-sm text-gray-text">Right docs at the right time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">👁️</div>
                <h3 className="font-semibold text-navy mb-1">Engagement signals</h3>
                <p className="text-sm text-gray-text">Track views and downloads</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
