import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({ 
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

const SITE_URL = 'https://investiaflow.com';

export const metadata: Metadata = {
  title: 'InvestiaFlow — Fundraising, organized and automated',
  description: 'Move investors through stages. InvestiaFlow automatically shares the right documents at the right time—so you don\'t have to.',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      es: '/?lang=es',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'InvestiaFlow — Fundraising, organized and automated',
    description: 'Move investors through stages. InvestiaFlow automatically shares the right documents at the right time—so you don\'t have to.',
    type: 'website',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvestiaFlow — Fundraising, organized and automated',
    description: 'Move investors through stages. InvestiaFlow automatically shares the right documents at the right time—so you don\'t have to.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'InvestiaFlow',
  applicationCategory: 'BusinessApplication',
  description: 'Fundraising CRM with automated document sharing and investor pipeline management.',
  url: SITE_URL,
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
