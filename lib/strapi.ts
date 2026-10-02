import { emptyCmsContent, type CmsContent, type CmsCookieSettings, type CmsFooter, type CmsJob, type CmsLeadership, type CmsMedia, type CmsNavigationItem, type CmsOffice, type CmsPage, type CmsSection, type CmsSEO, type CmsSettings } from '@/lib/cms-content'
import type { Article, ArticleContentBlock, Industry, Service, SiteMode } from '@/lib/igas-data'

type ApiRecord = Record<string, unknown>

type ApiResponse = {
  data?: ApiRecord[]
}

export type SiteSearchResult = { title: string; description: string; href: string; type: 'Service' | 'Industry' | 'Article' | 'Page' | 'Job' }

function attributes(record: ApiRecord): ApiRecord {
  return record.attributes && typeof record.attributes === 'object' ? record.attributes as ApiRecord : record
}

function stringValue(record: ApiRecord, key: string, fallback = '') {
  return typeof record[key] === 'string' ? record[key] as string : fallback
}

function numberValue(record: ApiRecord, key: string) {
  return typeof record[key] === 'number' ? record[key] as number : undefined
}

function booleanValue(record: ApiRecord, key: string, fallback = false) {
  return typeof record[key] === 'boolean' ? record[key] as boolean : fallback
}

function mergeSettings(fallback: CmsSettings, record: ApiRecord): CmsSettings {
  const item = attributes(record)
  const keys = Object.keys(fallback).filter((key) => key !== 'seo' && key !== 'cookieConsent') as Array<Exclude<keyof CmsSettings, 'seo' | 'cookieConsent'>>
  const settings = keys.reduce((current, key) => ({
    ...current,
    [key]: stringValue(item, key, current[key]),
  }), fallback)
  return {
    ...settings,
    seo: seoValue(item.seo), cookieConsent: cookieSettingsValue(item.cookieConsent),
  }
}

function cookieSettingsValue(value: unknown): CmsCookieSettings | undefined {
  if (!value || typeof value !== 'object') return undefined
  const item = attributes(value as ApiRecord)
  return { enabled: booleanValue(item, 'enabled', true), title: stringValue(item, 'title'), description: stringValue(item, 'description'), acceptLabel: stringValue(item, 'acceptLabel'), rejectLabel: stringValue(item, 'rejectLabel'), manageLabel: stringValue(item, 'manageLabel'), essentialLabel: stringValue(item, 'essentialLabel'), analyticsLabel: stringValue(item, 'analyticsLabel'), marketingLabel: stringValue(item, 'marketingLabel'), privacyLabel: stringValue(item, 'privacyLabel'), privacyHref: stringValue(item, 'privacyHref') }
}

function normalizeSection(record: ApiRecord): CmsSection {
  const item = attributes(record)
  const component = typeof record.__component === 'string' ? record.__component : stringValue(item, '__component')
  const media = mediaComponent(item.image)
  return { ...item, __component: component, imageUrl: stringValue(item, 'imageUrl', media?.src), imageAlt: stringValue(item, 'imageAlt', media?.alt) }
}

function contentBlocks(value: unknown): ArticleContentBlock[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((block): block is ArticleContentBlock => {
    if (!block || typeof block !== 'object') return false
    const item = block as Record<string, unknown>
    return typeof item.type === 'string' && (!item.children || Array.isArray(item.children))
  })
}

function mediaValue(value: unknown, fallbackUrl = '', fallbackAlt = ''): CmsMedia | undefined {
  if (!value || typeof value !== 'object') return fallbackUrl ? { src: fallbackUrl, alt: fallbackAlt } : undefined
  const record = value as ApiRecord
  const nested = record.data && typeof record.data === 'object' ? record.data as ApiRecord : record
  const item = attributes(nested)
  const src = stringValue(item, 'url', fallbackUrl)
  if (!src) return undefined
  return { src, alt: stringValue(item, 'alternativeText', fallbackAlt), width: numberValue(item, 'width'), height: numberValue(item, 'height'), caption: stringValue(item, 'caption') }
}

function seoValue(value: unknown): CmsSEO | undefined {
  if (!value || typeof value !== 'object') return undefined
  const item = attributes(value as ApiRecord)
  return {
    metaTitle: stringValue(item, 'metaTitle') || undefined,
    metaDescription: stringValue(item, 'metaDescription') || undefined,
    canonicalUrl: stringValue(item, 'canonicalUrl') || undefined,
    noIndex: booleanValue(item, 'noIndex'),
    ogTitle: stringValue(item, 'ogTitle') || undefined,
    ogDescription: stringValue(item, 'ogDescription') || undefined,
    ogImage: mediaValue(item.ogImage),
    twitterImage: mediaValue(item.twitterImage),
  }
}

function mediaComponent(value: unknown, fallbackUrl = '', fallbackAlt = '') {
  if (!value || typeof value !== 'object') return mediaValue(undefined, fallbackUrl, fallbackAlt)
  const item = attributes(value as ApiRecord)
  return mediaValue(item.file, fallbackUrl, stringValue(item, 'alt', fallbackAlt))
}

function normalizeJob(record: ApiRecord, mode: SiteMode): CmsJob {
  const item = attributes(record)
  return {
    title: stringValue(item, 'title'),
    slug: stringValue(item, 'slug'),
    shortDescription: stringValue(item, 'shortDescription'),
    description: contentBlocks(item.description),
    responsibilities: contentBlocks(item.responsibilities),
    qualifications: contentBlocks(item.qualifications),
    requirements: contentBlocks(item.requirements),
    benefits: contentBlocks(item.benefits),
    department: stringValue(item, 'department'),
    employmentType: stringValue(item, 'employmentType'),
    location: stringValue(item, 'location'),
    officeSlug: typeof item.office === 'object' && item.office ? stringValue(attributes(item.office as ApiRecord), 'slug') : undefined,
    applicationCTA: stringValue(item, 'applicationCTA'),
    applicationStatus: stringValue(item, 'applicationStatus', 'open') as CmsJob['applicationStatus'],
    deadline: stringValue(item, 'deadline'),
    type: stringValue(item, 'employmentType'),
    mode,
    updatedAt: stringValue(item, 'updatedAt') || undefined,
    seo: seoValue(item.seo),
  }
}

function normalizeOffice(record: ApiRecord, mode: SiteMode): CmsOffice {
  const item = attributes(record)
  const name = stringValue(item, 'name', stringValue(item, 'city'))
  return {
    name,
    slug: stringValue(item, 'slug'),
    city: stringValue(item, 'city'),
    country: stringValue(item, 'country'),
    detail: stringValue(item, 'address', stringValue(item, 'description')),
    address: stringValue(item, 'address'),
    phone: stringValue(item, 'phone'),
    email: stringValue(item, 'email'),
    description: contentBlocks(item.description),
    media: mediaComponent(item.image, stringValue(item, 'imageUrl'), stringValue(item, 'imageAlt', name)),
    latitude: numberValue(item, 'latitude'),
    longitude: numberValue(item, 'longitude'),
    mode,
    updatedAt: stringValue(item, 'updatedAt') || undefined,
    seo: seoValue(item.seo),
  }
}

function normalizeLeadership(record: ApiRecord, mode: SiteMode): CmsLeadership {
  const item = attributes(record)
  const name = stringValue(item, 'name')
  return {
    name,
    slug: stringValue(item, 'slug'),
    position: stringValue(item, 'position'),
    biography: contentBlocks(item.biography),
    media: mediaComponent(item.profileImage, '', name),
    email: stringValue(item, 'email'),
    linkedInUrl: stringValue(item, 'linkedInUrl'),
    mode,
    updatedAt: stringValue(item, 'updatedAt') || undefined,
    seo: seoValue(item.seo),
  }
}

function normalizeNavigation(record: ApiRecord): CmsNavigationItem {
  const item = attributes(record)
  return {
    label: stringValue(item, 'label'),
    href: stringValue(item, 'href'),
    group: stringValue(item, 'group'),
    parentGroup: stringValue(item, 'parentGroup') || undefined,
    menuType: stringValue(item, 'menuType', 'header') as CmsNavigationItem['menuType'],
    external: booleanValue(item, 'external'),
    cta: booleanValue(item, 'cta'),
    visible: booleanValue(item, 'visible', true),
    mode: stringValue(item, 'mode', 'india') as SiteMode,
    order: numberValue(item, 'order') || 0,
  }
}

function normalizeLinkList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((link): link is ApiRecord => Boolean(link && typeof link === 'object')).map((link) => {
    const item = attributes(link)
    return { label: stringValue(item, 'label'), href: stringValue(item, 'href'), external: booleanValue(item, 'external'), order: numberValue(item, 'order') || 0 }
  })
}

function normalizeFooter(record: ApiRecord, mode: SiteMode): CmsFooter {
  const item = attributes(record)
  const columns = Array.isArray(item.columns) ? item.columns.filter((column): column is ApiRecord => Boolean(column && typeof column === 'object')).map((column) => {
    const value = attributes(column)
    return { heading: stringValue(value, 'heading'), order: numberValue(value, 'order') || 0, links: normalizeLinkList(value.links) }
  }) : []
  const socialLinks = Array.isArray(item.socialLinks) ? item.socialLinks.filter((link): link is ApiRecord => Boolean(link && typeof link === 'object')).map((link) => {
    const value = attributes(link)
    return { label: stringValue(value, 'label'), href: stringValue(value, 'href'), order: numberValue(value, 'order') || 0 }
  }) : []
  return {
    mode,
    columns,
    quote: stringValue(item, 'quote'),
    quoteAuthor: stringValue(item, 'quoteAuthor'),
    signature: stringValue(item, 'signature'),
    contactEmail: stringValue(item, 'contactEmail'),
    contactPhone: stringValue(item, 'contactPhone'),
    newsletterTitle: stringValue(item, 'newsletterTitle'),
    newsletterDescription: stringValue(item, 'newsletterDescription'),
    newsletterEyebrow: stringValue(item, 'newsletterEyebrow'),
    newsletterSuccess: stringValue(item, 'newsletterSuccess'),
    emailLabel: stringValue(item, 'emailLabel'),
    emailPlaceholder: stringValue(item, 'emailPlaceholder'),
    subscribeLabel: stringValue(item, 'subscribeLabel'),
    contactHeading: stringValue(item, 'contactHeading'),
    copyright: stringValue(item, 'copyright'),
    usefulHeading: stringValue(item, 'usefulHeading'),
    legalHeading: stringValue(item, 'legalHeading'),
    usefulLinks: normalizeLinkList(item.usefulLinks),
    legalLinks: normalizeLinkList(item.legalLinks),
    socialLinks,
  }
}

async function requestCollection(path: string, url: string, token: string) {
  const response = await fetch(`${url}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Strapi request failed: ${response.status}`)
  const payload = await response.json() as ApiResponse
  return payload.data || []
}

/** Search only published Strapi records. Static fallback data is deliberately excluded. */
export async function searchSiteContent(query: string, mode: SiteMode = 'india'): Promise<SiteSearchResult[]> {
  const term = query.trim()
  const url = process.env.STRAPI_URL?.replace(/\/$/, '')
  const token = process.env.STRAPI_API_TOKEN
  if (!term || term.length < 2 || !url || !token) return []
  const filter = encodeURIComponent(term)
  const base = `filters[mode][$eq]=${mode}&pagination[pageSize]=20`
  const collections = [
    { endpoint: 'services', type: 'Service' as const, prefix: '/services', field: 'title' },
    { endpoint: 'industries', type: 'Industry' as const, prefix: '/industries', field: 'title' },
    { endpoint: 'articles', type: 'Article' as const, prefix: '/articles', field: 'title' },
    { endpoint: 'jobs', type: 'Job' as const, prefix: '/careers', field: 'title', openOnly: true },
  ]
  let failures = 0
  const results = await Promise.all(collections.map(async ({ endpoint, type, prefix, field, openOnly }) => {
    const status = openOnly ? '&filters[applicationStatus][$eq]=open' : ''
    const records = await requestCollectionSafely(`/api/${endpoint}?${base}${status}&filters[${field}][$containsi]=${filter}&populate=*&sort=sortOrder:asc`, url, token, `search ${endpoint}`, () => { failures += 1 })
    return records.flatMap((record): SiteSearchResult[] => {
      const item = attributes(record)
      const slug = stringValue(item, 'slug')
      const title = stringValue(item, 'title')
      if (!slug || !title) return []
      return [{ title, description: stringValue(item, 'excerpt', stringValue(item, 'shortDescription', stringValue(item, 'description'))), href: `${prefix}/${slug}`, type }]
    })
  }))
  const pages = await requestCollectionSafely(`/api/pages?filters[mode][$eq]=${mode}&filters[$or][0][title][$containsi]=${filter}&filters[$or][1][description][$containsi]=${filter}&pagination[pageSize]=20`, url, token, 'search pages', () => { failures += 1 })
  if (failures === collections.length + 1) throw new Error('All Strapi search requests failed.')
  const pageResults = pages.flatMap((record): SiteSearchResult[] => {
    const item = attributes(record)
    const path = stringValue(item, 'path')
    const title = stringValue(item, 'title')
    if (!path || !title) return []
    return [{ title, description: stringValue(item, 'description'), href: path, type: 'Page' }]
  })
  const all = [...results.flat(), ...pageResults]
  const seen = new Set<string>()
  return all.filter((item) => !seen.has(item.href) && Boolean(seen.add(item.href)))
}

async function requestCollectionSafely(path: string, url: string, token: string, label: string, onError?: () => void) {
  try {
    return await requestCollection(path, url, token)
  } catch (error) {
    onError?.()
    // An unavailable optional collection is an empty result; authentication and
    // transport errors still need to be visible so the CMS connection can be fixed.
    if (!(error instanceof Error) || !error.message.endsWith(': 404')) {
      console.error(`Unable to load Strapi ${label}; rendering an empty result.`, error)
    }
    return []
  }
}

function formatDate(value: string, fallback: string) {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export async function getStrapiContent(mode: SiteMode = 'india'): Promise<CmsContent> {
  const empty = emptyCmsContent(mode)
  const url = process.env.STRAPI_URL?.replace(/\/$/, '')
  const token = process.env.STRAPI_API_TOKEN
  if (!url || !token) return empty
  let requestFailed = false
  const load = (path: string, label: string) => requestCollectionSafely(path, url, token, label, () => { requestFailed = true })

  try {
    const [serviceRecords, industryRecords, articleRecords, settingRecords, jobRecords, officeRecords, leadershipRecords, navigationRecords, footerRecords] = await Promise.all([
      load(`/api/services?filters[mode][$eq]=${mode}&sort=sortOrder:asc&populate=*&populate[heroImage][populate]=file&populate[seo][populate]=*&pagination[pageSize]=100`, 'services'),
      load(`/api/industries?filters[mode][$eq]=${mode}&sort=sortOrder:asc&populate=*&populate[heroImage][populate]=file&populate[seo][populate]=*&pagination[pageSize]=100`, 'industries'),
      load(`/api/articles?filters[mode][$eq]=${mode}&sort=date:desc&populate=*&populate[featuredImage][populate]=file&populate[seo][populate]=*&pagination[pageSize]=100`, 'articles'),
      load(`/api/site-settings?filters[mode][$eq]=${mode}&populate[cookieConsent]=*&populate[seo][populate]=*&pagination[pageSize]=1`, 'site settings'),
      load(`/api/jobs?filters[mode][$eq]=${mode}&sort=sortOrder:asc&populate=*&populate[office]=*&populate[seo][populate]=*&pagination[pageSize]=100`, 'jobs'),
      load(`/api/offices?filters[mode][$eq]=${mode}&sort=sortOrder:asc&populate=*&populate[image][populate]=file&populate[seo][populate]=*&pagination[pageSize]=100`, 'offices'),
      load(`/api/leadership-profiles?filters[mode][$eq]=${mode}&sort=sortOrder:asc&populate=*&populate[profileImage][populate]=file&populate[seo][populate]=*&pagination[pageSize]=100`, 'leadership'),
      load(`/api/navigation-items?filters[mode][$eq]=${mode}&filters[visible][$eq]=true&sort=order:asc&pagination[pageSize]=100`, 'navigation'),
      load(`/api/footers?filters[mode][$eq]=${mode}&populate=*&populate[columns][populate][links]=*&populate[socialLinks]=*&populate[usefulLinks]=*&populate[legalLinks]=*&pagination[pageSize]=1`, 'footer'),
    ])

    const services: Service[] = serviceRecords.map((record) => {
      const item = attributes(record)
      return {
        title: stringValue(item, 'title'),
        description: stringValue(item, 'description', stringValue(item, 'shortDescription')),
        slug: stringValue(item, 'slug'),
        tag: stringValue(item, 'tag'),
        shortDescription: stringValue(item, 'shortDescription', stringValue(item, 'description')),
        fullContent: contentBlocks(item.fullContent),
        media: mediaComponent(item.heroImage, stringValue(item, 'imageUrl'), stringValue(item, 'imageAlt')),
        mode: stringValue(item, 'mode', mode) as 'india' | 'global',
        updatedAt: stringValue(item, 'updatedAt') || undefined,
        seo: seoValue(item.seo),
      }
    })

    const industries: CmsContent['industries'] = industryRecords.map((record) => {
      const item = attributes(record)
      const title = stringValue(item, 'title')
      return {
        title,
        description: stringValue(item, 'description', stringValue(item, 'shortDescription')),
        slug: stringValue(item, 'slug'),
        media: {
          ...(mediaComponent(item.heroImage, stringValue(item, 'imageUrl'), stringValue(item, 'imageAlt', `${title} sector context`)) || { src: '', alt: `${title} sector context` }),
        },
        mode: stringValue(item, 'mode', mode) as 'india' | 'global',
        updatedAt: stringValue(item, 'updatedAt') || undefined,
      }
    })

    const articles: CmsContent['articles'] = articleRecords.map((record) => {
      const item = attributes(record)
      const title = stringValue(item, 'title')
      const imageMedia = mediaComponent(item.featuredImage, stringValue(item, 'imageUrl'), stringValue(item, 'imageAlt', `${title} editorial image`))
      const image = imageMedia?.src || ''
      const article: Article = {
        title,
        excerpt: stringValue(item, 'excerpt'),
        category: stringValue(item, 'category'),
        date: formatDate(stringValue(item, 'date'), ''),
        slug: stringValue(item, 'slug'),
        image,
        content: contentBlocks(item.content),
        author: stringValue(item, 'author'),
        contentType: stringValue(item, 'contentType', 'insight'),
        featured: booleanValue(item, 'featured'),
        mode: stringValue(item, 'mode', mode) as 'india' | 'global',
        updatedAt: stringValue(item, 'updatedAt') || undefined,
        seo: seoValue(item.seo),
      }
      return {
        ...article,
        media: imageMedia || { src: image, alt: stringValue(item, 'imageAlt', `${title} editorial image`) },
        demo: false as const,
      }
    })

    return {
      ...empty,
      settings: settingRecords.length ? mergeSettings(empty.settings, settingRecords[0]) : empty.settings,
      services,
      industries,
      articles,
      jobs: jobRecords.map((record) => normalizeJob(record, mode)),
      offices: officeRecords.map((record) => normalizeOffice(record, mode)),
      leadership: leadershipRecords.map((record) => normalizeLeadership(record, mode)),
      navigation: navigationRecords.map(normalizeNavigation),
      footer: footerRecords.length ? normalizeFooter(footerRecords[0], mode) : undefined,
      unavailable: requestFailed,
    }
  } catch (error) {
    console.error('Unable to load or normalize Strapi content; rendering empty CMS content.', error)
    return { ...empty, unavailable: true }
  }
}

export async function getStrapiPage(pathname: string, mode: SiteMode = 'india'): Promise<CmsPage | null> {
  const url = process.env.STRAPI_URL?.replace(/\/$/, '')
  const token = process.env.STRAPI_API_TOKEN
  if (!url || !token) return null

  try {
    const records = await requestCollection(`/api/pages?filters[path][$eq]=${encodeURIComponent(pathname)}&filters[mode][$eq]=${mode}&populate[seo][populate]=*&populate[sections][populate]=*&populate[sections][populate][items][populate]=*&populate[sections][populate][slides][populate]=*&populate[sections][populate][image][populate]=file&pagination[pageSize]=1`, url, token)
    if (!records.length) return null
    const [navigationRecords, footerRecords] = await Promise.all([
      requestCollectionSafely(`/api/navigation-items?filters[mode][$eq]=${mode}&filters[visible][$eq]=true&sort=order:asc&pagination[pageSize]=100`, url, token, `${mode} navigation`),
      requestCollectionSafely(`/api/footers?filters[mode][$eq]=${mode}&populate=*&populate[columns][populate][links]=*&populate[socialLinks]=*&populate[usefulLinks]=*&populate[legalLinks]=*&pagination[pageSize]=1`, url, token, `${mode} footer`),
    ])
    const item = attributes(records[0])
    const rawSections = Array.isArray(item.sections) ? item.sections : []
    return {
      path: stringValue(item, 'path', pathname),
      mode,
      title: stringValue(item, 'title'),
      description: stringValue(item, 'description'),
      seo: seoValue(item.seo),
      updatedAt: stringValue(item, 'updatedAt') || undefined,
      navigation: navigationRecords.map(normalizeNavigation),
      footer: footerRecords.length ? normalizeFooter(footerRecords[0], mode) : undefined,
      sections: rawSections.filter((section): section is ApiRecord => Boolean(section && typeof section === 'object')).map(normalizeSection),
    }
  } catch (error) {
    // A missing CMS page is normal: the frontend has a built-in homepage and
    // other route fallbacks. Avoid reporting that expected miss as a server error.
    if (!(error instanceof Error) || !error.message.endsWith(': 404')) {
      console.error(`Unable to load CMS page ${pathname}.`, error)
    }
    return null
  }
}

export async function getStrapiPagePaths(mode: SiteMode = 'india'): Promise<Array<{ path: string; lastModified?: string }>> {
  const url = process.env.STRAPI_URL?.replace(/\/$/, '')
  const token = process.env.STRAPI_API_TOKEN
  if (!url || !token) return []
  const records = await requestCollectionSafely(`/api/pages?filters[mode][$eq]=${mode}&fields[0]=path&pagination[pageSize]=100`, url, token, `${mode} page paths`)
  return records.map((record) => { const item = attributes(record); return { path: stringValue(item, 'path'), lastModified: stringValue(item, 'updatedAt') || undefined } }).filter((item) => Boolean(item.path))
}
