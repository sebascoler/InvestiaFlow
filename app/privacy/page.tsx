import type { Metadata } from 'next'
import { LegalLayout } from '@/components/landing/LegalLayout'
import { PrivacyContent } from '@/components/landing/PrivacyContent'

export const metadata: Metadata = {
  title: 'Privacy Policy | InvestiaFlow',
  description: 'Privacy Policy of InvestiaFlow.',
  robots: 'index, follow',
}

export default function PrivacyPage() {
  return (
    <LegalLayout>
      <PrivacyContent />
    </LegalLayout>
  )
}
