"use client"

import { copy, type Lang } from '@/lib/copy'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function FinalCTA({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[var(--off-white)]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-navy mb-6">
            {t.finalCta.headline}
          </h2>
          <p className="text-xl text-gray-text mb-8">
            {t.finalCta.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => window.open('https://app.investiaflow.com/signup', '_blank')}
              className="w-full sm:w-auto"
            >
              {t.finalCta.startFree}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('https://calendly.com/investiaflow/demo', '_blank')}
              className="w-full sm:w-auto"
            >
              {t.finalCta.bookDemo}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
