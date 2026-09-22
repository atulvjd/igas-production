import type { MetadataRoute } from 'next'
import { articles, industries, jobs, services } from '@/lib/igas-data'
import { absoluteUrl, isIndexingEnabled } from '@/lib/site-url'
import { getStrapiContent, getStrapiPagePaths } from '@/lib/strapi'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexingEnabled()) return []
  const routes = ['/', '/global', '/about', '/leadership', '/contact', '/services', '/industries', '/latest-thinking', '/offices', '/careers', '/useful-links', '/privacy']
  const [india, global, indiaPages, globalPages] = await Promise.all([getStrapiContent('india'), getStrapiContent('global'), getStrapiPagePaths('india'), getStrapiPagePaths('global')])
  const entries: Array<{ path: string; mode: 'india' | 'global'; lastModified?: string }> = routes.map((path) => ({ path, mode: 'india' }))
  const addCollection = (mode: 'india' | 'global', items: Array<{ slug: string; updatedAt?: string }>, prefix: string) => items.forEach((item) => entries.push({ path: `${prefix}/${item.slug}`, mode, lastModified: item.updatedAt }))
  addCollection('india', services, '/services')
  addCollection('india', industries, '/industries')
  addCollection('india', articles, '/latest-thinking')
  addCollection('india', jobs, '/careers')
  addCollection('india', india.services, '/services')
  addCollection('india', india.industries, '/industries')
  addCollection('india', india.articles, '/latest-thinking')
  addCollection('india', india.jobs, '/careers')
  addCollection('india', india.offices, '/offices')
  addCollection('india', india.leadership, '/leadership')
  addCollection('global', global.jobs, '/careers')
  addCollection('global', global.offices, '/offices')
  addCollection('global', global.leadership, '/leadership')
  indiaPages.forEach((page) => entries.push({ path: page.path, mode: 'india', lastModified: page.lastModified }))
  globalPages.forEach((page) => entries.push({ path: page.path, mode: 'global', lastModified: page.lastModified }))
  const seen = new Set<string>()
  return entries.flatMap((entry) => { const url = absoluteUrl(entry.path, entry.mode); if (seen.has(url)) return []; seen.add(url); return [{ url, lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined }] })
}
