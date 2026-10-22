import type { MetadataRoute } from 'next'
import { absoluteUrl, getSiteOrigin, hasSeparateSiteOrigins, isIndexingEnabled } from '@/lib/site-url'
import { getStrapiContent, getStrapiPagePaths } from '@/lib/strapi'
import { builtInStaticRoutes, isValidCmsPagePath } from '@/lib/routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexingEnabled()) return []
  const separateOrigins = hasSeparateSiteOrigins()
  const modes = separateOrigins ? ['india', 'global'] as const : ['india'] as const
  const entries: Array<{ path: string; mode: 'india' | 'global'; lastModified?: string }> = modes.flatMap((mode) => builtInStaticRoutes
    .filter((path) => path !== '/global' && path !== '/articles')
    .map((path) => ({ path, mode })))
  if (!separateOrigins) entries.push({ path: '/global', mode: 'global' })

  const [india, globalContent, indiaPages, globalPages] = await Promise.all([
    getStrapiContent('india'),
    separateOrigins ? getStrapiContent('global') : Promise.resolve(undefined),
    getStrapiPagePaths('india'),
    separateOrigins ? getStrapiPagePaths('global') : Promise.resolve(undefined),
  ])
  const global = globalContent || india
  const publishedGlobalPages = globalPages || []
  const addCollection = (mode: 'india' | 'global', items: Array<{ slug: string; updatedAt?: string }>, prefix: string) => items.forEach((item) => entries.push({ path: `${prefix}/${item.slug}`, mode, lastModified: item.updatedAt }))
  for (const mode of modes) {
    const content = mode === 'india' ? india : global
    addCollection(mode, content.services, '/services')
    addCollection(mode, content.industries, '/industries')
    addCollection(mode, content.articles, '/latest-thinking')
    addCollection(mode, content.jobs, '/careers')
    addCollection(mode, content.offices, '/offices')
    addCollection(mode, content.leadership, '/leadership')
  }
  indiaPages.filter((page) => isValidCmsPagePath(page.path)).forEach((page) => entries.push({ path: page.path, mode: 'india', lastModified: page.lastModified }))
  publishedGlobalPages.filter((page) => isValidCmsPagePath(page.path) && separateOrigins).forEach((page) => entries.push({ path: page.path, mode: 'global', lastModified: page.lastModified }))
  const seen = new Set<string>()
  return entries.flatMap((entry) => {
    const url = absoluteUrl(entry.path, entry.mode)
    const siteOrigin = getSiteOrigin(entry.mode).origin
    if (!url.startsWith(`${siteOrigin}/`) || seen.has(url)) return []
    seen.add(url)
    return [{ url, lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined }]
  })
}
