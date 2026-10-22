import type { SiteMode } from '@/lib/igas-data'

export const siteName = 'IGAS Global'
export const siteDescription = 'Official IGAS website.'

function parseSiteOrigin(configured: string, variable: string) {
  const url = new URL(configured)
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${variable} must contain only a site origin, without credentials, paths, queries, or fragments.`)
  }
  if (process.env.NODE_ENV === 'production' && (url.protocol !== 'https:' || /localhost|127\.0\.0\.1/i.test(url.hostname))) {
    throw new Error(`${variable} must be an approved HTTPS production origin.`)
  }
  return url
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!configured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_SITE_URL must be configured for production builds.')
    }
    return new URL('http://localhost:3000')
  }
  return parseSiteOrigin(configured, 'NEXT_PUBLIC_SITE_URL')
}

/** Indexing is opt-in so preview/staging URLs cannot become search results by accident. */
export function isIndexingEnabled() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!configured) return false
  return process.env.NODE_ENV === 'production' && process.env.ALLOW_INDEXING === 'true' && !/localhost|127\.0\.0\.1/i.test(configured)
}

export function getSiteOrigin(mode: SiteMode = 'india') {
  const configured = mode === 'global' ? process.env.NEXT_PUBLIC_GLOBAL_SITE_URL?.trim() : process.env.NEXT_PUBLIC_INDIA_SITE_URL?.trim()
  return configured ? parseSiteOrigin(configured, mode === 'global' ? 'NEXT_PUBLIC_GLOBAL_SITE_URL' : 'NEXT_PUBLIC_INDIA_SITE_URL') : getSiteUrl()
}

export function hasSeparateSiteOrigins() {
  const india = process.env.NEXT_PUBLIC_INDIA_SITE_URL?.trim()
  const global = process.env.NEXT_PUBLIC_GLOBAL_SITE_URL?.trim()
  if (!india || !global) return false
  return parseSiteOrigin(india, 'NEXT_PUBLIC_INDIA_SITE_URL').hostname
    !== parseSiteOrigin(global, 'NEXT_PUBLIC_GLOBAL_SITE_URL').hostname
}

export function modeForHostname(hostname: string | null, pathname: string): SiteMode {
  const india = process.env.NEXT_PUBLIC_INDIA_SITE_URL?.trim()
  const global = process.env.NEXT_PUBLIC_GLOBAL_SITE_URL?.trim()
  // Hostname routing is deliberately inactive until both explicit, distinct origins exist.
  if (hostname && india && global) {
    try {
      const indiaHost = new URL(india).hostname.toLowerCase()
      const globalHost = new URL(global).hostname.toLowerCase()
      if (indiaHost !== globalHost && hostname.toLowerCase().split(':')[0] === globalHost) return 'global'
      if (indiaHost !== globalHost && hostname.toLowerCase().split(':')[0] === indiaHost) return 'india'
    } catch { /* invalid configuration falls back to the established path behavior */ }
  }
  return pathname === '/global' ? 'global' : 'india'
}

export function absoluteUrl(path = '/', mode: SiteMode = 'india') {
  return new URL(path, getSiteOrigin(mode)).toString()
}
