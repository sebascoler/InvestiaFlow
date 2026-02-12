"use client"

import { copy, type Lang } from '@/lib/copy'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

export function ProductTour({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--off-white)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-navy mb-4">
            {t.productTour.title}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {t.productTour.screens.map((screen, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-[var(--blue)]/20 to-[var(--teal)]/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🖥️</div>
                    <p className="text-gray-text text-sm">Screen {index + 1}</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-navy mb-2 font-heading">
                    {screen.title}
                  </h3>
                  <p className="text-sm text-gray-text">
                    {screen.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
