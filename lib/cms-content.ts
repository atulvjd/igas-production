import type { Article, Industry, Job, Office, Service, SiteMode } from '@/lib/igas-data'

export type CmsMedia = { src: string; alt: string; width?: number; height?: number; caption?: string }
export type CmsRelatedItem = { title: string; slug: string }
export type CmsStatistic = { value: string; label: string; detail: string; order?: number }
export type CmsSEO = { metaTitle?: string; metaDescription?: string; canonicalUrl?: string; noIndex?: boolean; ogTitle?: string; ogDescription?: string; ogImage?: CmsMedia; twitterImage?: CmsMedia }
export type CmsJob = Job & { shortDescription: string; description?: Article['content']; responsibilities?: Article['content']; qualifications?: Article['content']; requirements?: Article['content']; benefits?: Article['content']; department?: string; employmentType: string; officeSlug?: string; applicationCTA?: string; applicationUrl?: string; applicationStatus: 'open' | 'paused' | 'closed'; deadline?: string; mode: SiteMode; updatedAt?: string; seo?: CmsSEO }
export type CmsOffice = Office & { name: string; slug: string; address?: string; phone?: string; email?: string; description?: Article['content']; media?: CmsMedia; latitude?: number; longitude?: number; services: CmsRelatedItem[]; mode: SiteMode; updatedAt?: string; seo?: CmsSEO }
export type CmsLeadership = { name: string; slug: string; position: string; biography?: Article['content']; media?: CmsMedia; email?: string; linkedInUrl?: string; relatedServices: CmsRelatedItem[]; relatedIndustries: CmsRelatedItem[]; mode: SiteMode; updatedAt?: string; seo?: CmsSEO }
export type CmsFocusArea = { media?: CmsMedia; title: string; slug: string; description: string; industries: Array<Pick<Industry, 'title' | 'slug'>>; mode: SiteMode; sortOrder: number }
export type CmsMegaMenu = { section: 'what-we-do' | 'where-we-focus' | 'who-we-are' | 'latest-thinking' | 'careers'; label: string; title: string; description: string; ctaLabel: string; ctaHref: string; sortOrder: number }
export type CmsNavigationItem = { label: string; href: string; group: string; parentGroup?: string; description?: string; menuType: 'header' | 'mobile' | 'footer'; external: boolean; cta: boolean; visible: boolean; mode: SiteMode; order: number }
export type CmsFooter = { columns?: Array<{ heading: string; order: number; links: Array<{ label: string; href: string; external: boolean; order: number }> }>; newsletterSuccess?: string; emailLabel?: string; emailPlaceholder?: string; subscribeLabel?: string; mode: SiteMode; quote?: string; quoteAuthor?: string; signature?: string; contactEmail?: string; contactPhone?: string; newsletterTitle?: string; newsletterDescription?: string; copyright?: string; usefulLinks: Array<{ label: string; href: string; external: boolean; order: number }>; legalLinks: Array<{ label: string; href: string; external: boolean; order: number }>; socialLinks: Array<{ label: string; href: string; order: number }> }
export type CmsSettings = {
  mode: SiteMode
  logo?: CmsMedia
  globalLogo?: CmsMedia
  contactCtaLabel: string
  contactCtaHref: string
  searchLabel: string
  searchPlaceholder: string
  contactImageUrl?: string
  contactImageAlt?: string
  aboutPageImageUrl?: string
  aboutPageImageAlt?: string
  careersPageImageUrl?: string
  careersPageImageAlt?: string
  presenceImageUrl?: string
  presenceImageAlt?: string
  leadershipImageUrl?: string
  leadershipImageAlt?: string
  heroEyebrow: string
  heroTitle: string
  heroIntro: string
  heroCta: string
  heroCtaHref: string
  heroImageUrl: string
  heroImage?: CmsMedia
  statementTitle: string
  statementIntro: string
  statementCtaLabel: string
  statementCtaHref: string
  aboutTitle: string
  aboutText: string
  aboutCtaLabel: string
  aboutCtaHref: string
  aboutImageUrl: string
  aboutImage?: CmsMedia
  presenceTitle: string
  presenceText: string
  careersTitle: string
  careersText: string
  careersImageUrl: string
  careersImage?: CmsMedia
  contactEyebrow: string
  contactTitle: string
  contactIntro: string
  contactConsentText: string
  contactSuccessMessage: string
  cookieTitle: string
  cookieDescription: string
  cookieAcceptLabel: string
  cookieRejectLabel: string
  cookieManageLabel: string
  cookieEssentialLabel: string
  cookieAnalyticsLabel: string
  cookieMarketingLabel: string
  newsletterTitle: string
  footerSignature: string
  contactEmail: string
  contactPhone: string
  megaMenus: CmsMegaMenu[]
  seo?: CmsSEO
}
export type CmsService = Service & { media?: CmsMedia; relatedIndustries: CmsRelatedItem[]; relatedArticles: CmsRelatedItem[]; relatedLeadership: CmsRelatedItem[] }
export type CmsIndustry = Industry & { media: CmsMedia; relatedServices: CmsRelatedItem[]; relatedArticles: CmsRelatedItem[] }
export type CmsArticle = Article & { media: CmsMedia; relatedArticles: CmsRelatedItem[]; relatedServices: CmsRelatedItem[]; relatedIndustries: CmsRelatedItem[] }
export type CmsContent = { mode: SiteMode; settings: CmsSettings; services: CmsService[]; industries: CmsIndustry[]; focusAreas: CmsFocusArea[]; articles: CmsArticle[]; jobs: CmsJob[]; offices: CmsOffice[]; leadership: CmsLeadership[]; navigation: CmsNavigationItem[]; pages: Array<{ title: string; path: string; description: string }>; footer?: CmsFooter; statistics: CmsStatistic[] }
export type CmsSection = { __component: string; [key: string]: unknown }
export type CmsPage = { path: string; mode: SiteMode; title: string; description: string; seo?: CmsSEO; navigation?: CmsNavigationItem[]; footer?: CmsFooter; updatedAt?: string; sections: CmsSection[] }

const defaultMegaMenus: CmsMegaMenu[] = [
  { section: 'what-we-do', label: 'What we do', title: '', description: '', ctaLabel: '', ctaHref: '/services', sortOrder: 0 },
  { section: 'where-we-focus', label: 'Where we focus', title: '', description: '', ctaLabel: '', ctaHref: '/industries', sortOrder: 1 },
  { section: 'who-we-are', label: 'Who we are', title: '', description: '', ctaLabel: '', ctaHref: '/about', sortOrder: 2 },
  { section: 'latest-thinking', label: 'Latest thinking', title: '', description: '', ctaLabel: '', ctaHref: '/latest-thinking', sortOrder: 3 },
  { section: 'careers', label: 'Careers', title: '', description: '', ctaLabel: '', ctaHref: '/careers', sortOrder: 4 },
]

export function createEmptyCmsContent(mode: SiteMode = 'india'): CmsContent {
  return {
    mode,
    settings: {
      mode,
      logo: undefined, globalLogo: undefined, contactCtaLabel: '', contactCtaHref: '', searchLabel: '', searchPlaceholder: '',
      contactImageUrl: '', contactImageAlt: '', aboutPageImageUrl: '', aboutPageImageAlt: '', careersPageImageUrl: '', careersPageImageAlt: '', presenceImageUrl: '', presenceImageAlt: '', leadershipImageUrl: '', leadershipImageAlt: '',
      heroEyebrow: '', heroTitle: '', heroIntro: '', heroCta: '', heroCtaHref: '/contact', heroImageUrl: '', heroImage: undefined,
      statementTitle: '', statementIntro: '', statementCtaLabel: '', statementCtaHref: '/about', aboutTitle: '', aboutText: '', aboutCtaLabel: '', aboutCtaHref: '/about', aboutImageUrl: '',
      presenceTitle: '', presenceText: '', careersTitle: '', careersText: '', careersImageUrl: '',
      aboutImage: undefined, careersImage: undefined, contactEyebrow: '', contactTitle: '', contactIntro: '', contactConsentText: '', contactSuccessMessage: '',
      cookieTitle: '', cookieDescription: '', cookieAcceptLabel: '', cookieRejectLabel: '', cookieManageLabel: '', cookieEssentialLabel: '', cookieAnalyticsLabel: '', cookieMarketingLabel: '',
      newsletterTitle: '', footerSignature: '', contactEmail: '', contactPhone: '',
      megaMenus: defaultMegaMenus,
    },
    services: [], industries: [], focusAreas: [], articles: [], jobs: [], offices: [],
    leadership: [],
    navigation: [],
    pages: [],
    footer: undefined,
    statistics: [],
  }
}
