"use client"

import { copy, type Lang } from '@/lib/copy'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Pricing({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--off-white)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-navy mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-xl text-gray-text mb-2">{t.pricing.subtitle}</p>
          <p className="text-sm text-gray-text">{t.pricing.note}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.pricing.plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full flex flex-col ${index === 1 ? 'border-2 border-[var(--blue)] shadow-lg' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl font-heading">{plan.name}</CardTitle>
                    {index === 1 && (
                      <Badge variant="default">{lang === 'en' ? 'Popular' : 'Popular'}</Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-navy">{plan.price}</span>
                    {plan.price !== '€0' && (
                      <span className="text-gray-text">/month</span>
                    )}
                  </div>
                  <CardDescription className="mt-4 text-sm">
                    {plan.bestFor}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <span className="text-[var(--teal)] mt-1">✓</span>
                        <span className="text-sm text-gray-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={index === 1 ? 'default' : 'outline'}
                    onClick={() => window.open('https://app.investiaflow.com/signup', '_blank')}
                  >
                    {copy[lang].nav.startFree}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
