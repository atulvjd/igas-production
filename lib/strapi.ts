import { getCmsContent, type CmsContent, type CmsFooter, type CmsJob, type CmsLeadership, type CmsMedia, type CmsNavigationItem, type CmsOffice, type CmsPage, type CmsSection, type CmsSEO, type CmsSettings } from '@/lib/cms-content'
import type { Article, ArticleContentBlock, Industry, Service, SiteMode } from '@/lib/igas-data'

type ApiRecord = Record<string, unknown>

type ApiResponse = {
  data?: ApiRecord[]
}

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
  const keys = Object.keys(fallback).filter((key) => key !== 'seo') as Array<Exclude<keyof CmsSettings, 'seo'>>
  const settings = keys.reduce((current, key) => ({
    ...current,
    [key]: stringValue(item, key, current[key]),
  }), fallback)
  return { ...settings, seo: seoValue(item.seo) || settings.seo }
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
  const socialLinks = Array.isArray(item.socialLinks) ? item.socialLinks.filter((link): link is ApiRecord => Boolean(link && typeof link === 'object')).map((link) => {
    const value = attributes(link)
    return { label: stringValue(value, 'label'), href: stringValue(value, 'href'), order: numberValue(value, 'order') || 0 }
  }) : []
  return {
    mode,
    quote: stringValue(item, 'quote'),
    quoteAuthor: stringValue(item, 'quoteAuthor'),
    signature: stringValue(item, 'signature'),
    contactEmail: stringValue(item, 'contactEmail'),
    contactPhone: stringValue(item, 'contactPhone'),
    newsletterTitle: stringValue(item, 'newsletterTitle'),
    newsletterDescription: stringValue(item, 'newsletterDescription'),
    copyright: stringValue(item, 'copyright'),
    usefulLinks: normalizeLinkList(item.usefulLinks),
    legalLinks: normalizeLinkList(item.legalLinks),
    socialLinks,
  }
}

async function requestCollection(path: string, url: string, token: string) {
  const response = await fetch(`${url}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  })
  if (!response.ok) throw new Error(`Strapi request failed: ${response.status}`)
  const payload = await response.json() as ApiResponse
  return payload.data || []
}

async function requestCollectionSafely(path: string, url: string, token: string, label: string) {
  try {
    return await requestCollection(path, url, token)
  } catch (error) {
    console.error(`Unable to load Strapi ${label}; using fallback content.`, error)
    return []
  }
}

function formatDate(value: string, fallback: string) {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export async function getStrapiContent(mode: SiteMode = 'india'): Promise<CmsContent> {
  const fallback = getCmsContent(mode)
  const url = process.env.STRAPI_URL?.replace(/\/$/, '')
  const token = process.env.STRAPI_API_TOKEN
  if (!url || !token) return fallback

  try {
    const [serviceRecords, industryRecords, articleRecords, settingRecords, jobRecords, officeRecords, leadershipRecords, navigationRecords, footerRecords] = await Promise.all([
      requestCollectionSafely(`/api/services?filters[mode][$eq]=${mode}&sort=sortOrder:asc&populate=*&pagination[pageSize]=100`, url, token, 'services'),
      requestCollectionSafely(`/api/industries?filters[mode][$eq]=${mode}&sort=sortOrder:asc&populate=*&pagination[pageSize]=100`, url, token, 'industries'),
      requestCollectionSafely(`/api/articles?filters[mode][$eq]=${mode}&sort=date:desc&populate=*&pagination[pageSize]=100`, url, token, 'articles'),
      requestCollectionSafely(`/api/site-settings?filters[mode][$eq]=${mode}&pagination[pageSize]=1`, url, token, 'site settings'),
      requestCollectionSafely(`/api/jobs?filters[mode][$eq]=${mode}&sort=sortOrder:asc&populate=*&pagination[pageSize]=100`, url, token, 'jobs'),
      requestCollectionSafely(`/api/offices?filters[mode][$eq]=${mode}&sort=sortOrder:asc&populate=*&pagination[pageSize]=100`, url, token, 'offices'),
      requestCollectionSafely(`/api/leadership-profiles?filters[mode][$eq]=${mode}&sort=sortOrder:asc&populate=*&pagination[pageSize]=100`, url, token, 'leadership'),
      requestCollectionSafely(`/api/navigation-items?filters[mode][$eq]=${mode}&filters[visible][$eq]=true&sort=order:asc&pagination[pageSize]=100`, url, token, 'navigation'),
      requestCollectionSafely(`/api/footers?filters[mode][$eq]=${mode}&populate=*&pagination[pageSize]=1`, url, token, 'footer'),
    ])

    const services: Service[] = serviceRecords.length ? serviceRecords.map((record) => {
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
    }) : fallback.services

    const industries: CmsContent['industries'] = industryRecords.length ? industryRecords.map((record) => {
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
    }) : fallback.industries

    const articles: CmsContent['articles'] = articleRecords.length ? articleRecords.map((record) => {
      const item = attributes(record)
      const title = stringValue(item, 'title')
      const imageMedia = mediaComponent(item.featuredImage, stringValue(item, 'imageUrl'), stringValue(item, 'imageAlt', `${title} editorial image`))
      const image = imageMedia?.src || ''
      const fallbackArticle = fallback.articles.find((article) => article.slug === stringValue(item, 'slug'))
      const article: Article = {
        title,
        excerpt: stringValue(item, 'excerpt'),
        category: stringValue(item, 'category'),
        date: formatDate(stringValue(item, 'date'), fallbackArticle?.date || ''),
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
        demo: false,
      }
    }) : fallback.articles

    return {
      ...fallback,
      settings: settingRecords.length ? mergeSettings(fallback.settings, settingRecords[0]) : fallback.settings,
      services,
      industries,
      articles,
      jobs: jobRecords.length ? jobRecords.map((record) => normalizeJob(record, mode)) : fallback.jobs,
      offices: officeRecords.length ? officeRecords.map((record) => normalizeOffice(record, mode)) : fallback.offices,
      leadership: leadershipRecords.map((record) => normalizeLeadership(record, mode)),
      navigation: navigationRecords.map(normalizeNavigation),
      footer: footerRecords.length ? normalizeFooter(footerRecords[0], mode) : fallback.footer,
    }
  } catch (error) {
    console.error('Unable to normalize Strapi content; using static fallback.', error)
    return fallback
  }
}

export async function getStrapiPage(pathname: string, mode: SiteMode = 'india'): Promise<CmsPage | null> {
  const url = process.env.STRAPI_URL?.replace(/\/$/, '')
  const token = process.env.STRAPI_API_TOKEN
  if (!url || !token) return null

  try {
    const records = await requestCollection(`/api/pages?filters[path][$eq]=${encodeURIComponent(pathname)}&filters[mode][$eq]=${mode}&populate[sections][populate]=*&pagination[pageSize]=1`, url, token)
    if (!records.length) return null
    const [navigationRecords, footerRecords] = await Promise.all([
      requestCollectionSafely(`/api/navigation-items?filters[mode][$eq]=${mode}&filters[visible][$eq]=true&sort=order:asc&pagination[pageSize]=100`, url, token, `${mode} navigation`),
      requestCollectionSafely(`/api/footers?filters[mode][$eq]=${mode}&populate=*&pagination[pageSize]=1`, url, token, `${mode} footer`),
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
    console.error(`Unable to load CMS page ${pathname}.`, error)
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
