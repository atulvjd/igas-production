'use client'

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'
import { useCallback, useEffect, useState } from 'react'

const consentCookie = 'igas-consent=analytics'

function hasAnalyticsConsent() {
  return typeof document !== 'undefined' && document.cookie.split('; ').includes(consentCookie)
}

export function ConsentAwareAnalytics() {
  const [hasEverConsented, setHasEverConsented] = useState(false)

  useEffect(() => {
    const syncConsent = () => {
      if (hasAnalyticsConsent()) setHasEverConsented(true)
    }
    syncConsent()
    window.addEventListener('igas-consent-change', syncConsent)
    return () => window.removeEventListener('igas-consent-change', syncConsent)
  }, [])

  const beforeSend = useCallback((event: BeforeSendEvent) => {
    return hasAnalyticsConsent() ? event : null
  }, [])

  if (process.env.NODE_ENV !== 'production' || !hasEverConsented) return null
  return <Analytics beforeSend={beforeSend} />
}
