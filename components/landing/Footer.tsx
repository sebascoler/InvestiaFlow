"use client"

import Link from 'next/link'
import { copy, type Lang } from '@/lib/copy'

export function Footer({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <footer className="bg-navy text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold font-heading mb-4">InvestiaFlow</h3>
            <p className="text-gray-400 text-sm">
              {t.footer.launching}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#product" className="hover:text-white transition-colors">
                  {t.nav.product}
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  {t.nav.howItWorks}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  {t.nav.pricing}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href={lang === 'es' ? '/privacy?lang=es' : '/privacy'} className="hover:text-white transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href={lang === 'es' ? '/terms?lang=es' : '/terms'} className="hover:text-white transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="mailto:hello@investiaflow.com" className="hover:text-white transition-colors">
                  {t.footer.contact}
                </a>
              </li>
              <li>
                <a href="https://app.investiaflow.com/login" className="hover:text-white transition-colors">
                  {t.footer.login}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
