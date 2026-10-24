import { createEmptyCmsContent, type CmsContent, type CmsFooter, type CmsFocusArea, type CmsJob, type CmsLeadership, type CmsMedia, type CmsNavigationItem, type CmsOffice, type CmsPage, type CmsSection, type CmsSEO, type CmsSettings } from '@/lib/cms-content'
import type { Article, ArticleContentBlock, Industry, Service, SiteMode } from '@/lib/igas-data'
import { sortArticles } from '@/lib/article-content'

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

function mediaUrl(value: string) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  const base = process.env.STRAPI_URL?.replace(/\/$/, '')
  if (!base) return value
  try { return new URL(value.startsWith('/') ? value : `/${value}`, base).toString() } catch { return value }
}

function mergeSettings(fallback: CmsSettings, record: ApiRecord): CmsSettings {
  const item = attributes(record)
  const mediaKeys = ['logo', 'globalLogo', 'heroImage', 'aboutImage', 'careersImage']
  const keys = Object.keys(fallback).filter((key) => key !== 'seo' && key !== 'megaMenus' && !mediaKeys.includes(key)) as Array<Exclude<keyof CmsSettings, 'seo' | 'megaMenus' | 'logo' | 'globalLogo' | 'heroImage' | 'aboutImage' | 'careersImage'>>
  const settings = keys.reduce((current, key) => ({
    ...current,
    [key]: stringValue(item, key, current[key]),
  }), fallback)
  const menuRecords = Array.isArray(item.megaMenus) ? item.megaMenus : []
  const megaMenus = fallback.megaMenus.map((defaultMenu) => {
    const record = menuRecords.find((menu): menu is ApiRecord => Boolean(menu && typeof menu === 'object' && stringValue(attributes(menu as ApiRecord), 'section') === defaultMenu.section))
    if (!record) return defaultMenu
    const menu = attributes(record)
    return {
      section: defaultMenu.section,
      label: stringValue(menu, 'label', defaultMenu.label),
      title: stringValue(menu, 'title', defaultMenu.title),
      description: stringValue(menu, 'description', defaultMenu.description),
      ctaLabel: stringValue(menu, 'ctaLabel', defaultMenu.ctaLabel),
      ctaHref: stringValue(menu, 'ctaHref', defaultMenu.ctaHref),
      sortOrder: numberValue(menu, 'sortOrder') ?? defaultMenu.sortOrder,
    }
  }).sort((left, right) => left.sortOrder - right.sortOrder)
  return {
    ...settings,
    contactConsentText: settings.contactConsentText || stringValue(item, 'contactConsent'),
    contactSuccessMessage: settings.contactSuccessMessage || stringValue(item, 'contactSuccess'),
    ...Object.fromEntries(['title', 'description', 'acceptLabel', 'rejectLabel', 'manageLabel', 'essentialLabel', 'analyticsLabel', 'marketingLabel'].flatMap(key => {
      const field = `cookie${key[0].toUpperCase()}${key.slice(1)}` as keyof CmsSettings
      const value = item.cookieConsent && typeof item.cookieConsent === 'object' ? stringValue(item.cookieConsent as ApiRecord, key) : ''
      return !settings[field] && value ? [[field, value]] : []
    })),
    heroImageUrl: mediaUrl(settings.heroImageUrl),
    aboutImageUrl: mediaUrl(settings.aboutImageUrl),
    careersImageUrl: mediaUrl(settings.careersImageUrl),
    heroImage: mediaComponent(item.heroImage),
    aboutImage: mediaComponent(item.aboutImage),
    careersImage: mediaComponent(item.careersImage),
    logo: mediaComponent(item.logo),
    globalLogo: mediaComponent(item.globalLogo),
    megaMenus,
    seo: seoValue(item.seo) || settings.seo,
  }
}

function normalizeSection(record: ApiRecord): CmsSection {
  const item = attributes(record)
  const component = typeof record.__component === 'string' ? record.__component : stringValue(item, '__component')
  const media = mediaComponent(item.image)
  const slides = Array.isArray(item.slides) ? item.slides.map((slide) => {
    if (!slide || typeof slide !== 'object') return slide
    const value = attributes(slide as ApiRecord)
    const slideMedia = mediaComponent(value.image)
    return { ...value, imageUrl: mediaUrl(stringValue(value, 'imageUrl', slideMedia?.src || '')), imageAlt: stringValue(value, 'imageAlt', slideMedia?.alt) }
  }) : item.slides
  return { ...item, slides, __component: component, imageUrl: mediaUrl(stringValue(item, 'imageUrl', media?.src || '')), imageAlt: stringValue(item, 'imageAlt', media?.alt) }
}

function normalizeStatistics(value: unknown): CmsContent['statistics'] {
  if (!Array.isArray(value)) return []
  return value.filter((record): record is ApiRecord => Boolean(record && typeof record === 'object'))
    .map((record) => attributes(record))
    .filter((item) => booleanValue(item, 'active', true))
    .map((item) => ({
      value: `${stringValue(item, 'value')}${stringValue(item, 'suffix')}`,
      label: stringValue(item, 'label'),
      detail: stringValue(item, 'detail'),
      order: numberValue(item, 'sortOrder') || 0,
    }))
    .sort((left, right) => (left.order || 0) - (right.order || 0))
}

function contentBlocks(value: unknown): ArticleContentBlock[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((block): block is ArticleContentBlock => {
    if (!block || typeof block !== 'object') return false
    const item = block as Record<string, unknown>
    return typeof item.type === 'string' && (!item.children || Array.isArray(item.children))
  }).map(function normalizeBlock(block): ArticleContentBlock {
    return { ...block, ...(block.image ? { image: { ...block.image, url: mediaUrl(block.image.url) } } : {}), children: block.children?.map(normalizeBlock) }
  })
}

function mediaValue(value: unknown, fallbackUrl = '', fallbackAlt = ''): CmsMedia | undefined {
  if (!value || typeof value !== 'object') return fallbackUrl ? { src: fallbackUrl, alt: fallbackAlt } : undefined
  const record = value as ApiRecord
  const nested = record.data && typeof record.data === 'object' ? record.data as ApiRecord : record
  const item = attributes(nested)
  const src = mediaUrl(stringValue(item, 'url', fallbackUrl))
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
    noIndex: typeof item.noIndex === 'boolean' ? item.noIndex : undefined,
    ogTitle: stringValue(item, 'ogTitle') || undefined,
    ogDescription: stringValue(item, 'ogDescription') || undefined,
    ogImage: mediaValue(item.ogImage),
    twitterImage: mediaValue(item.twitterImage),
  }
}

function mediaComponent(value: unknown, fallbackUrl = '', fallbackAlt = '') {
  if (!value || typeof value !== 'object') return mediaValue(undefined, fallbackUrl, fallbackAlt)
  const item = attributes(value as ApiRecord)
  const media = mediaValue(item.file, fallbackUrl, stringValue(item, 'alt', fallbackAlt))
  return media ? { ...media, alt: stringValue(item, 'alt') || media.alt, caption: stringValue(item, 'caption') || media.caption } : undefined
}

function relationRecords(value: unknown): ApiRecord[] {
  if (!value || typeof value !== 'object') return []
  const record = value as ApiRecord
  const relation = record.data ?? value
  if (Array.isArray(relation)) return relation.filter((item): item is ApiRecord => Boolean(item && typeof item === 'object'))
  return relation && typeof relation === 'object' ? [relation as ApiRecord] : []
}

function relatedItems(value: unknown, labelField: 'title' | 'name' = 'title') {
  return relationRecords(value).map((record) => {
    const item = attributes(record)
    return { title: stringValue(item, labelField, stringValue(item, labelField === 'title' ? 'name' : 'title')), slug: stringValue(item, 'slug') }
  }).filter((item) => Boolean(item.slug && item.title))
}

function normalizeJob(record: ApiRecord, mode: SiteMode): CmsJob {
  const item = attributes(record)
  const officeRecord = relationRecords(item.office)[0]
  const office = officeRecord ? attributes(officeRecord) : undefined
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
    officeSlug: office ? stringValue(office, 'slug') : undefined,
    applicationCTA: stringValue(item, 'applicationCTA'),
    applicationUrl: stringValue(item, 'applicationUrl') || undefined,
    applicationStatus: (['open', 'paused', 'closed'] as const).includes(stringValue(item, 'applicationStatus', 'open') as CmsJob['applicationStatus']) ? stringValue(item, 'applicationStatus', 'open') as CmsJob['applicationStatus'] : 'open',
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
    services: relatedItems(item.services),
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
    relatedServices: relatedItems(item.relatedServices),
    relatedIndustries: relatedItems(item.relatedIndustries),
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
    description: stringValue(item, 'description') || undefined,
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
  }).sort((left, right) => left.order - right.order)
}

function normalizeFooter(record: ApiRecord, mode: SiteMode): CmsFooter {
  const item = attributes(record)
  const socialLinks = Array.isArray(item.socialLinks) ? item.socialLinks.filter((link): link is ApiRecord => Boolean(link && typeof link === 'object')).map((link) => {
    const value = attributes(link)
    return { label: stringValue(value, 'label'), href: stringValue(value, 'href'), order: numberValue(value, 'order') || 0 }
  }).sort((left, right) => left.order - right.order) : []
  return {
    mode,
    quote: stringValue(item, 'quote'),
    quoteAuthor: stringValue(item, 'quoteAuthor'),
    signature: stringValue(item, 'signature'),
    contactEmail: stringValue(item, 'contactEmail'),
    contactPhone: stringValue(item, 'contactPhone'),
    columns: Array.isArray(item.columns) ? item.columns.filter((column): column is ApiRecord => Boolean(column && typeof column === 'object')).map(column => {
      const value = attributes(column)
      return { heading: stringValue(value, 'heading'), order: numberValue(value, 'order') || 0, links: normalizeLinkList(value.links) }
    }).sort((a, b) => a.order - b.order) : [],
    newsletterSuccess: stringValue(item, 'newsletterSuccess'),
    emailLabel: stringValue(item, 'emailLabel'),
    emailPlaceholder: stringValue(item, 'emailPlaceholder'),
    subscribeLabel: stringValue(item, 'subscribeLabel'),
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
    next: { revalidate: 60, tags: ['strapi-content'] },
  })
  if (!response.ok) throw new Error(`Strapi request failed: ${response.status}`)
  const payload = await response.json() as ApiResponse
  return payload.data || []
}

async function requestCollectionSafely(path: string, url: string, token: string, label: string, onError?: () => void) {
  try {
    return await requestCollection(path, url, token)
  } catch (error) {
    onError?.()
    console.error(`Unable to load Strapi ${label}.`, error)
    return []
  }
}

function formatDate(value: string, fallback: string) {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function modeFilter(mode: SiteMode) {
  const filters = new URLSearchParams()
  filters.set('filters[$or][0][mode][$eq]', mode)
  filters.set('filters[$or][1][mode][$null]', 'true')
  return filters.toString()
}

export async function getStrapiContent(mode: SiteMode = 'india'): Promise<CmsContent> {
  const emptyContent = createEmptyCmsContent(mode)
  const url = process.env.STRAPI_URL?.replace(/\/$/, '')
  const token = process.env.STRAPI_API_TOKEN
  if (!url || !token) return emptyContent

  try {
    const [serviceRecords, industryRecords, articleRecords, settingRecords, jobRecords, officeRecords, leadershipRecords, navigationRecords, footerRecords, focusAreaRecords, pageRecords] = await Promise.all([
      requestCollectionSafely(`/api/services?${modeFilter(mode)}&sort=sortOrder:asc&populate=*&pagination[pageSize]=100`, url, token, 'services'),
      requestCollectionSafely(`/api/industries?${modeFilter(mode)}&sort=sortOrder:asc&populate=*&pagination[pageSize]=100`, url, token, 'industries'),
      requestCollectionSafely(`/api/articles?${modeFilter(mode)}&sort[0]=sortOrder:asc&sort[1]=date:desc&sort[2]=slug:asc&populate=*&pagination[pageSize]=100`, url, token, 'articles'),
      requestCollectionSafely(`/api/site-settings?${modeFilter(mode)}&populate=*&pagination[pageSize]=1`, url, token, 'site settings'),
      requestCollectionSafely(`/api/jobs?${modeFilter(mode)}&sort=sortOrder:asc&populate=*&pagination[pageSize]=100`, url, token, 'jobs'),
      requestCollectionSafely(`/api/offices?${modeFilter(mode)}&sort=sortOrder:asc&populate=*&pagination[pageSize]=100`, url, token, 'offices'),
      requestCollectionSafely(`/api/leadership-profiles?${modeFilter(mode)}&sort=sortOrder:asc&populate=*&pagination[pageSize]=100`, url, token, 'leadership'),
      requestCollectionSafely(`/api/navigation-items?${modeFilter(mode)}&filters[visible][$eq]=true&sort=order:asc&pagination[pageSize]=100`, url, token, 'navigation'),
      requestCollectionSafely(`/api/footers?${modeFilter(mode)}&populate=*&populate[columns][populate][links]=*&pagination[pageSize]=1`, url, token, 'footer'),
      requestCollectionSafely(`/api/focus-areas?${modeFilter(mode)}&sort=sortOrder:asc&populate[industries][fields][0]=title&populate[industries][fields][1]=slug&pagination[pageSize]=100`, url, token, 'focus areas'),
      requestCollectionSafely(`/api/pages?${modeFilter(mode)}&fields[0]=path&fields[1]=title&fields[2]=description&pagination[pageSize]=100`, url, token, 'pages'),
    ])

    const services: CmsContent['services'] = serviceRecords.length ? serviceRecords.map((record) => {
      const item = attributes(record)
      return {
        title: stringValue(item, 'title'),
        description: stringValue(item, 'description', stringValue(item, 'shortDescription')),
        slug: stringValue(item, 'slug'),
        tag: stringValue(item, 'tag'),
        shortDescription: stringValue(item, 'shortDescription', stringValue(item, 'description')),
        fullContent: contentBlocks(item.fullContent),
        media: mediaComponent(item.heroImage, stringValue(item, 'imageUrl'), stringValue(item, 'imageAlt')),
        relatedIndustries: relatedItems(item.relatedIndustries),
        relatedArticles: relatedItems(item.relatedArticles),
        relatedLeadership: relatedItems(item.relatedLeadership, 'name'),
        mode: stringValue(item, 'mode', mode) as 'india' | 'global',
        updatedAt: stringValue(item, 'updatedAt') || undefined,
        seo: seoValue(item.seo),
      }
    }) : []

    const industries: CmsContent['industries'] = industryRecords.length ? industryRecords.map((record) => {
      const item = attributes(record)
      const title = stringValue(item, 'title')
      return {
        title,
        description: stringValue(item, 'description', stringValue(item, 'shortDescription')),
        slug: stringValue(item, 'slug'),
        shortDescription: stringValue(item, 'shortDescription', stringValue(item, 'description')),
        fullContent: contentBlocks(item.fullContent),
        media: {
          ...(mediaComponent(item.heroImage, stringValue(item, 'imageUrl'), stringValue(item, 'imageAlt', `${title} sector context`)) || { src: '', alt: `${title} sector context` }),
        },
        relatedServices: relatedItems(item.relatedServices),
        relatedArticles: relatedItems(item.relatedArticles),
        seo: seoValue(item.seo),
        mode: stringValue(item, 'mode', mode) as 'india' | 'global',
        updatedAt: stringValue(item, 'updatedAt') || undefined,
      }
    }) : []

    const focusAreas: CmsFocusArea[] = focusAreaRecords.length ? focusAreaRecords.map((record) => {
      const item = attributes(record)
      const related = item.industries && typeof item.industries === 'object' && !Array.isArray(item.industries)
        ? (item.industries as ApiRecord).data
        : item.industries
      const records = Array.isArray(related) ? related : []
      return {
        title: stringValue(item, 'title'),
        slug: stringValue(item, 'slug'),
        description: stringValue(item, 'description'),
        industries: records.map((relatedRecord) => {
          const industry = attributes(relatedRecord as ApiRecord)
          const slug = stringValue(industry, 'slug')
          const knownIndustry = industries.find((entry) => entry.slug === slug)
          return { slug, title: stringValue(industry, 'title', knownIndustry?.title || slug) }
        }).filter((industry) => industry.slug),
        mode: stringValue(item, 'mode', mode) as SiteMode,
        sortOrder: numberValue(item, 'sortOrder') || 0,
      }
    }) : []

    const articles: CmsContent['articles'] = articleRecords.length ? articleRecords.map((record) => {
      const item = attributes(record)
      const title = stringValue(item, 'title')
      const imageMedia = mediaComponent(item.featuredImage, stringValue(item, 'imageUrl'), stringValue(item, 'imageAlt', `${title} editorial image`))
      const image = imageMedia?.src || ''
      const article: Article = {
        title,
        excerpt: stringValue(item, 'excerpt'),
        category: stringValue(item, 'category'),
        date: formatDate(stringValue(item, 'publicationDate', stringValue(item, 'date')), ''),
        publicationDate: stringValue(item, 'publicationDate') || stringValue(item, 'date'),
        sortOrder: numberValue(item, 'sortOrder') ?? 0,
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
        relatedArticles: relatedItems(item.relatedArticles),
        relatedServices: relatedItems(item.relatedServices),
        relatedIndustries: relatedItems(item.relatedIndustries),
      }
    }) : []

    return {
      ...emptyContent,
      settings: settingRecords.length ? mergeSettings(emptyContent.settings, settingRecords[0]) : emptyContent.settings,
      services,
      industries,
      focusAreas,
      articles: sortArticles(articles),
      jobs: jobRecords.map((record) => normalizeJob(record, mode)).filter((job) => job.applicationStatus === 'open'),
      offices: officeRecords.map((record) => normalizeOffice(record, mode)),
      leadership: leadershipRecords.map((record) => normalizeLeadership(record, mode)),
      navigation: navigationRecords.map(normalizeNavigation),
      pages: pageRecords.map((record) => {
        const item = attributes(record)
        return { title: stringValue(item, 'title'), path: stringValue(item, 'path'), description: stringValue(item, 'description') }
      }),
      footer: footerRecords.length ? normalizeFooter(footerRecords[0], mode) : undefined,
      statistics: settingRecords.length ? normalizeStatistics(attributes(settingRecords[0]).statistics) : [],
    }
  } catch (error) {
    console.error('Unable to normalize Strapi content.', error)
    return emptyContent
  }
}

export async function getStrapiPage(pathname: string, mode: SiteMode = 'india'): Promise<CmsPage | null> {
  const url = process.env.STRAPI_URL?.replace(/\/$/, '')
  const token = process.env.STRAPI_API_TOKEN
  if (!url || !token) return null

  try {
    const records = await requestCollection(`/api/pages?filters[path][$eq]=${encodeURIComponent(pathname)}&${modeFilter(mode)}&populate[sections][populate]=*&pagination[pageSize]=1`, url, token)
    if (!records.length) return null
    const [navigationRecords, footerRecords] = await Promise.all([
      requestCollectionSafely(`/api/navigation-items?${modeFilter(mode)}&filters[visible][$eq]=true&sort=order:asc&pagination[pageSize]=100`, url, token, `${mode} navigation`),
      requestCollectionSafely(`/api/footers?${modeFilter(mode)}&populate=*&populate[columns][populate][links]=*&pagination[pageSize]=1`, url, token, `${mode} footer`),
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
  const records = await requestCollectionSafely(`/api/pages?${modeFilter(mode)}&fields[0]=path&pagination[pageSize]=100`, url, token, `${mode} page paths`)
  return records.map((record) => { const item = attributes(record); return { path: stringValue(item, 'path'), lastModified: stringValue(item, 'updatedAt') || undefined } }).filter((item) => Boolean(item.path))
}

export type SiteSearchResult = { title: string; description: string; href: string; type: 'Service' | 'Industry' | 'Article' | 'Page' | 'Job' }

export async function searchSiteContent(query: string, mode: SiteMode = 'india'): Promise<SiteSearchResult[]> {
  const term = query.trim()
  const url = process.env.STRAPI_URL?.replace(/\/$/, '')
  const token = process.env.STRAPI_API_TOKEN
  if (!term || term.length < 2 || !url || !token) return []
  const filter = encodeURIComponent(term)
  const base = `${modeFilter(mode)}&pagination[pageSize]=20`
  const collections = [
    { endpoint: 'services', type: 'Service' as const, prefix: '/services', field: 'title' },
    { endpoint: 'industries', type: 'Industry' as const, prefix: '/industries', field: 'title' },
    { endpoint: 'articles', type: 'Article' as const, prefix: '/latest-thinking', field: 'title' },
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
