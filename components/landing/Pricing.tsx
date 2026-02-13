"use client"

import { useState } from 'react'
import { copy, type Lang } from '@/lib/copy'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const SIGNUP_URL = 'https://app.investiaflow.com/signup'

export function Pricing({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const [yearly, setYearly] = useState(false)
  const plans = t.pricing.plans

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--off-white)]">
      <div className="max-w-4xl mx-auto">
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

        {/* Billing toggle: only relevant for Pro; show above cards for clarity */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!yearly ? 'bg-[var(--blue)] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t.pricing.billingMonthly}
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${yearly ? 'bg-[var(--blue)] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t.pricing.billingYearly}
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{t.pricing.saveYearly}</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, index) => {
            const isPro = plan.priceAnnual != null
            const displayPrice = isPro && yearly ? plan.priceAnnual : plan.price
            const displayPeriod = isPro && yearly ? plan.pricePeriodYearly : plan.pricePeriod
            const isHighlighted = isPro

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full flex flex-col ${isHighlighted ? 'border-2 border-[var(--blue)] shadow-lg' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-2xl font-heading">{plan.name}</CardTitle>
                      {plan.badge != null && plan.badge !== '' && (
                        <Badge variant="default">{plan.badge}</Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-navy">{displayPrice}</span>
                      {displayPeriod != null && displayPeriod !== '' && (
                        <span className="text-gray-text">{displayPeriod}</span>
                      )}
                    </div>
                    <CardDescription className="mt-4 text-sm">
                      {plan.bestFor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature, featureIndex) => {
                        const isFreeNegative = !isPro && featureIndex >= plan.features.length - 2
                        return (
                          <li key={featureIndex} className="flex items-start gap-2">
                            {isFreeNegative ? (
                              <span className="text-red-500 mt-1 flex-shrink-0" aria-hidden>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </span>
                            ) : (
                              <span className="text-[var(--teal)] mt-1">✓</span>
                            )}
                            <span className="text-sm text-gray-text">{feature}</span>
                          </li>
                        )
                      })}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isHighlighted ? 'default' : 'outline'}
                      onClick={() => window.open(SIGNUP_URL, '_blank')}
                    >
                      {plan.cta ?? t.nav.startFree}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
