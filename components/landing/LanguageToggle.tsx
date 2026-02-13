"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { copy, type Lang } from '@/lib/copy'

export function LanguageToggle({ lang }: { lang: Lang }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleLangChange = (newLang: Lang) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('lang', newLang)
    const search = current.toString()
    const query = search ? `?${search}` : ''
    const href = `${pathname || '/'}${query}`
    router.push(href, { scroll: false })
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
      <button
        onClick={() => handleLangChange('en')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          lang === 'en'
            ? 'bg-[var(--blue)] text-white'
            : 'text-gray-text hover:bg-gray-50'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => handleLangChange('es')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          lang === 'es'
            ? 'bg-[var(--blue)] text-white'
            : 'text-gray-text hover:bg-gray-50'
        }`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  )
}
