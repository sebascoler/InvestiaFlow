"use client"

import { copy, type Lang } from '@/lib/copy'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export function Trust({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-navy mb-4">
            {t.trust.title}
          </h2>
        </motion.div>

        <div className="space-y-4">
          {t.trust.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-4 p-6 bg-[var(--off-white)] rounded-xl"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--teal)] flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-gray-text text-lg">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
