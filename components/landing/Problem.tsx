"use client"

import { copy, type Lang } from '@/lib/copy'
import { motion } from 'framer-motion'

export function Problem({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <section id="product" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-navy mb-8">
            {t.problem.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {t.problem.bullets.map((bullet, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-[var(--off-white)] rounded-xl"
              >
                <div className="text-2xl">❌</div>
                <p className="text-lg text-gray-text text-left">{bullet}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
