import type { MetadataRoute } from 'next'
import { absoluteUrl, isIndexingEnabled } from '@/lib/site-url'
import { getStrapiContent, getStrapiPagePaths } from '@/lib/strapi'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexingEnabled()) return []
  const modes = ['india', 'global'] as const
  const [contents, pagePaths] = await Promise.all([
    Promise.all(modes.map((mode) => getStrapiContent(mode))),
    Promise.all(modes.map((mode) => getStrapiPagePaths(mode))),
  ])
  const entries: Array<{ path: string; mode: (typeof modes)[number]; lastModified?: string }> = []
  modes.forEach((mode, index) => {
    const content = contents[index]
    const pages = pagePaths[index]
    pages.forEach((page) => entries.push({ path: page.path, mode, lastModified: page.lastModified }))
    const add = (items: Array<{ slug: string; updatedAt?: string }>, prefix: string) => items.forEach((item) => entries.push({ path: `${prefix}/${item.slug}`, mode, lastModified: item.updatedAt }))
    add(content.services, '/services')
    add(content.industries, '/industries')
    add(content.articles, '/articles')
    add(content.jobs.filter((job) => job.applicationStatus === 'open'), '/careers')
    add(content.offices, '/offices')
    add(content.leadership, '/leadership')
    if (content.services.length) entries.push({ path: '/services', mode })
    if (content.industries.length) entries.push({ path: '/industries', mode })
    if (content.articles.length) entries.push({ path: '/articles', mode })
    if (content.jobs.some((job) => job.applicationStatus === 'open')) entries.push({ path: '/careers', mode })
    if (content.offices.length) entries.push({ path: '/offices', mode })
    if (content.leadership.length) entries.push({ path: '/leadership', mode })
  })
  const seen = new Set<string>()
  return entries.flatMap((entry) => {
    const url = absoluteUrl(entry.path, entry.mode)
    if (seen.has(url)) return []
    seen.add(url)
    return [{ url, lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined }]
  })
}
