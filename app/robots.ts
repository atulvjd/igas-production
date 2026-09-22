import type { MetadataRoute } from 'next'
import { absoluteUrl, isIndexingEnabled } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingEnabled()) return { rules: { userAgent: '*', disallow: '/' } }
  return { rules: { userAgent: '*', allow: '/' }, sitemap: absoluteUrl('/sitemap.xml') }
}
