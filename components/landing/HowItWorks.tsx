"use client"

import { copy, type Lang } from '@/lib/copy'
import { motion } from 'framer-motion'

export function HowItWorks({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--off-white)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-navy mb-4">
            {t.howItWorks.title}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {t.howItWorks.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--blue)] text-white font-bold text-xl mb-6">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold font-heading text-navy mb-3">
                {step.title}
              </h3>
              <p className="text-gray-text leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
