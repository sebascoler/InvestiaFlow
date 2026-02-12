"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
            <Badge variant="secondary" className="mb-6">
              {t.hero.socialProof}
            </Badge>
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
            <div className="aspect-video bg-gradient-to-br from-[var(--blue)]/10 to-[var(--teal)]/10 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8">
                <div className="bg-white/80 rounded-lg p-4 shadow-md">
                  <div className="h-2 bg-[var(--blue)] rounded mb-2"></div>
                  <div className="h-2 bg-[var(--blue)]/60 rounded mb-2 w-3/4"></div>
                  <div className="h-2 bg-[var(--blue)]/40 rounded"></div>
                </div>
                <div className="bg-white/80 rounded-lg p-4 shadow-md">
                  <div className="h-2 bg-[var(--teal)] rounded mb-2"></div>
                  <div className="h-2 bg-[var(--teal)]/60 rounded mb-2 w-2/3"></div>
                  <div className="h-2 bg-[var(--teal)]/40 rounded"></div>
                </div>
                <div className="bg-white/80 rounded-lg p-4 shadow-md">
                  <div className="h-2 bg-[var(--blue)] rounded mb-2"></div>
                  <div className="h-2 bg-[var(--blue)]/60 rounded mb-2 w-4/5"></div>
                  <div className="h-2 bg-[var(--blue)]/40 rounded"></div>
                </div>
              </div>
              <div className="relative z-10 text-center">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-text font-medium">Product Preview</p>
              </div>
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

        <div className="mt-12 flex items-center justify-center gap-8 opacity-60">
          <div className="h-12 w-24 bg-gray-300 rounded"></div>
          <div className="h-12 w-24 bg-gray-300 rounded"></div>
          <div className="h-12 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    </section>
  )
}
