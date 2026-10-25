'use client'

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'
import { useCallback, useEffect, useState } from 'react'
import { CONSENT_EVENT, CONSENT_STORAGE_KEY, hasAnalyticsConsent, refreshConsentFromStorage } from '@/lib/cookie-consent'

export function ConsentAwareAnalytics() {
  const [hasEverConsented, setHasEverConsented] = useState(false)

  useEffect(() => {
    const syncConsent = () => {
      if (hasAnalyticsConsent()) setHasEverConsented(true)
    }
    syncConsent()
    const syncStorage = (event: StorageEvent) => { if (event.key === CONSENT_STORAGE_KEY || event.key === null) { refreshConsentFromStorage(); syncConsent() } }
    window.addEventListener(CONSENT_EVENT, syncConsent)
    window.addEventListener('storage', syncStorage)
    return () => {
      window.removeEventListener(CONSENT_EVENT, syncConsent)
      window.removeEventListener('storage', syncStorage)
    }
  }, [])

  const beforeSend = useCallback((event: BeforeSendEvent) => {
    return hasAnalyticsConsent() ? event : null
  }, [])

  if (process.env.NODE_ENV !== 'production' || !hasEverConsented) return null
  return <Analytics beforeSend={beforeSend} />
}
