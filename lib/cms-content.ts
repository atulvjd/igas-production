import type { Article, ArticleContentBlock, Industry, Job, Office, Service, SiteMode } from '@/lib/igas-data'

export type CmsMedia = { src: string; alt: string; width?: number; height?: number; caption?: string }
export type CmsStatistic = { value: string; label: string; suffix?: string; detail: string; order: number; active: boolean }
export type CmsSEO = { metaTitle?: string; metaDescription?: string; canonicalUrl?: string; noIndex?: boolean; ogTitle?: string; ogDescription?: string; ogImage?: CmsMedia; twitterImage?: CmsMedia }
export type CmsJob = Job & { shortDescription: string; description?: ArticleContentBlock[]; responsibilities?: ArticleContentBlock[]; qualifications?: ArticleContentBlock[]; requirements?: ArticleContentBlock[]; benefits?: ArticleContentBlock[]; department?: string; employmentType: string; officeSlug?: string; applicationCTA?: string; applicationStatus: 'open' | 'paused' | 'closed'; deadline?: string; mode: SiteMode; updatedAt?: string; seo?: CmsSEO }
export type CmsOffice = Office & { name: string; slug: string; address?: string; phone?: string; email?: string; description?: ArticleContentBlock[]; media?: CmsMedia; latitude?: number; longitude?: number; mode: SiteMode; updatedAt?: string; seo?: CmsSEO }
export type CmsLeadership = { name: string; slug: string; position: string; biography?: ArticleContentBlock[]; media?: CmsMedia; email?: string; linkedInUrl?: string; mode: SiteMode; updatedAt?: string; seo?: CmsSEO }
export type CmsNavigationItem = { label: string; href: string; group: string; parentGroup?: string; menuType: 'header' | 'mobile' | 'footer'; external: boolean; cta: boolean; visible: boolean; mode: SiteMode; order: number }
export type CmsFooterLink = { label: string; href: string; external: boolean; order: number }
export type CmsFooterColumn = { heading: string; order: number; links: CmsFooterLink[] }
export type CmsFooter = { mode: SiteMode; quote?: string; quoteAuthor?: string; signature?: string; contactHeading?: string; contactEmail?: string; contactPhone?: string; newsletterEyebrow?: string; newsletterTitle?: string; newsletterDescription?: string; newsletterSuccess?: string; emailLabel?: string; emailPlaceholder?: string; subscribeLabel?: string; copyright?: string; usefulHeading?: string; legalHeading?: string; columns: CmsFooterColumn[]; usefulLinks: CmsFooterLink[]; legalLinks: CmsFooterLink[]; socialLinks: Array<{ label: string; href: string; order: number }> }
export type CmsCookieSettings = { enabled: boolean; title: string; description: string; acceptLabel: string; rejectLabel: string; manageLabel: string; essentialLabel: string; analyticsLabel: string; marketingLabel: string; privacyLabel: string; privacyHref: string }
export type CmsSettings = {
  mode: SiteMode; contactEmail: string; contactPhone: string; seo?: CmsSEO; cookieConsent?: CmsCookieSettings
  contactEyebrow: string; contactTitle: string; contactIntro: string; contactConsent: string; contactSuccess: string; contactPrivacyNote: string
}
export type CmsContent = { mode: SiteMode; settings: CmsSettings; services: Service[]; industries: Array<Industry & { media: CmsMedia }>; articles: Array<Article & { media: CmsMedia; demo: false }>; jobs: CmsJob[]; offices: CmsOffice[]; leadership: CmsLeadership[]; navigation: CmsNavigationItem[]; footer?: CmsFooter; statistics: CmsStatistic[]; unavailable: boolean }
export type CmsSection = { __component: string; [key: string]: unknown }
export type CmsPage = { path: string; mode: SiteMode; title: string; description: string; seo?: CmsSEO; navigation?: CmsNavigationItem[]; footer?: CmsFooter; updatedAt?: string; sections: CmsSection[] }

export function emptyCmsContent(mode: SiteMode): CmsContent {
  return {
    mode,
    settings: { mode, contactEmail: '', contactPhone: '', contactEyebrow: '', contactTitle: '', contactIntro: '', contactConsent: '', contactSuccess: '', contactPrivacyNote: '' },
    services: [], industries: [], articles: [], jobs: [], offices: [], leadership: [], navigation: [], statistics: [], unavailable: true,
  }
}
