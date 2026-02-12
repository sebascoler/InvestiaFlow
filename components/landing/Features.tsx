"use client"

import { copy, type Lang } from '@/lib/copy'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

const icons = [
  '📊', '⏰', '🔒', '⚡', '🚪', '👁️', '👥', '📈'
]

export function Features({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-navy mb-4">
            {t.features.title}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.features.items.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-3xl mb-4">{icons[index]}</div>
                  <h3 className="font-semibold text-navy mb-2 font-heading">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-text leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
