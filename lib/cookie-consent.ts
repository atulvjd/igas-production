export const CONSENT_COOKIE = 'igas-consent'
export const CONSENT_EVENT = 'igas-consent-change'
export const CONSENT_OPEN_EVENT = 'igas-consent-open'
const MAX_AGE = 365 * 24 * 60 * 60
export const CONSENT_STORAGE_KEY = 'igas-consent-preference'
type Consent = { analytics: boolean; expiresAt: number }
let sessionChoice: Consent | null = null

/** Cookie and storage access can fail in restricted mobile browsers. */
export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  if (sessionChoice && sessionChoice.expiresAt > Date.now()) return sessionChoice
  sessionChoice = null
  try {
    const saved = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) || 'null')
    if (saved && typeof saved.analytics === 'boolean' && typeof saved.expiresAt === 'number' && saved.expiresAt > Date.now()) return saved
  } catch { /* Fall back to the consent cookie. */ }
  try {
    const value = document.cookie.split(/;\s*/).find(cookie => cookie.startsWith(`${CONSENT_COOKIE}=`))?.split('=')[1]
    if (['analytics', 'all', 'essential'].includes(value || '')) return { analytics: value !== 'essential', expiresAt: Date.now() + MAX_AGE * 1000 }
  } catch { /* A browser may disable cookie access entirely. */ }
  return null
}

export function hasAnalyticsConsent() {
  return readConsent()?.analytics === true
}

export function saveConsent(analytics: boolean) {
  sessionChoice = { analytics, expiresAt: Date.now() + MAX_AGE * 1000 }
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${CONSENT_COOKIE}=${analytics ? 'analytics' : 'essential'}; max-age=${MAX_AGE}; path=/; SameSite=Lax${secure}`
  } catch { /* Dismissal must not depend on cookie storage being available. */ }
  try { window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(sessionChoice)) } catch { /* Keep the choice for this tab when storage is blocked. */ }
  window.dispatchEvent(new Event(CONSENT_EVENT))
}

export function refreshConsentFromStorage() {
  sessionChoice = null
}
