import type { Metadata } from 'next'
import { LegalLayout } from '@/components/landing/LegalLayout'
import { TermsContent } from '@/components/landing/TermsContent'

export const metadata: Metadata = {
  title: 'Terms of Service | InvestiaFlow',
  description: 'Terms of Service of InvestiaFlow.',
  robots: 'index, follow',
}

export default function TermsPage() {
  return (
    <LegalLayout>
      <TermsContent />
    </LegalLayout>
  )
}
