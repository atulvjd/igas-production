import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { absoluteUrl, getSiteUrl, isIndexingEnabled, siteDescription, siteName } from '@/lib/site-url'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: { default: siteName, template: '%s | IGAS Global' },
  description: siteDescription,
  robots: isIndexingEnabled() ? undefined : { index: false, follow: false },
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName, title: siteName, description: siteDescription, url: absoluteUrl('/'), images: [{ url: absoluteUrl('/og-image.svg'), width: 1200, height: 630, alt: 'IGAS Global — independent advisory for consequential decisions' }] },
  twitter: { card: 'summary_large_image', title: siteName, description: siteDescription, images: [absoluteUrl('/og-image.svg')] },
  generator: siteName,
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#172F5D',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased font-sans">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
