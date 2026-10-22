import { CmsChromeProvider, NotFoundPage } from '@/components/igas-site'
import { createEmptyCmsContent } from '@/lib/cms-content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The requested page is unavailable.',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  const content = createEmptyCmsContent()
  return <CmsChromeProvider navigation={content.navigation} content={content}><NotFoundPage /></CmsChromeProvider>
}
