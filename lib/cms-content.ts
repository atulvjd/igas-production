import { articles, industries, jobs, offices, services, siteSettings, stats, type Article, type Industry, type Job, type Office, type Service, type SiteMode } from '@/lib/igas-data'

export type CmsMedia = { src: string; alt: string; width?: number; height?: number; caption?: string }
export type CmsStatistic = { value: string; label: string; detail: string }
export type CmsSEO = { metaTitle?: string; metaDescription?: string; canonicalUrl?: string; noIndex?: boolean; ogTitle?: string; ogDescription?: string; ogImage?: CmsMedia; twitterImage?: CmsMedia }
export type CmsJob = Job & { shortDescription: string; description?: Article['content']; responsibilities?: Article['content']; qualifications?: Article['content']; requirements?: Article['content']; benefits?: Article['content']; department?: string; employmentType: string; officeSlug?: string; applicationCTA?: string; applicationStatus: 'open' | 'paused' | 'closed'; deadline?: string; mode: SiteMode; updatedAt?: string; seo?: CmsSEO }
export type CmsOffice = Office & { name: string; slug: string; address?: string; phone?: string; email?: string; description?: Article['content']; media?: CmsMedia; latitude?: number; longitude?: number; mode: SiteMode; updatedAt?: string; seo?: CmsSEO }
export type CmsLeadership = { name: string; slug: string; position: string; biography?: Article['content']; media?: CmsMedia; email?: string; linkedInUrl?: string; mode: SiteMode; updatedAt?: string; seo?: CmsSEO }
export type CmsNavigationItem = { label: string; href: string; group: string; parentGroup?: string; menuType: 'header' | 'mobile' | 'footer'; external: boolean; cta: boolean; visible: boolean; mode: SiteMode; order: number }
export type CmsFooter = { mode: SiteMode; quote?: string; quoteAuthor?: string; signature?: string; contactEmail?: string; contactPhone?: string; newsletterTitle?: string; newsletterDescription?: string; copyright?: string; usefulLinks: Array<{ label: string; href: string; external: boolean; order: number }>; legalLinks: Array<{ label: string; href: string; external: boolean; order: number }>; socialLinks: Array<{ label: string; href: string; order: number }> }
export type CmsSettings = {
  mode: SiteMode
  heroEyebrow: string
  heroTitle: string
  heroIntro: string
  heroCta: string
  heroImageUrl: string
  statementTitle: string
  statementIntro: string
  aboutTitle: string
  aboutText: string
  aboutImageUrl: string
  presenceTitle: string
  presenceText: string
  careersTitle: string
  careersText: string
  careersImageUrl: string
  newsletterTitle: string
  footerSignature: string
  contactEmail: string
  contactPhone: string
  seo?: CmsSEO
}
export type CmsContent = { mode: SiteMode; settings: CmsSettings; services: Service[]; industries: Array<Industry & { media: CmsMedia }>; articles: Array<Article & { media: CmsMedia; demo: boolean }>; jobs: CmsJob[]; offices: CmsOffice[]; leadership: CmsLeadership[]; navigation: CmsNavigationItem[]; footer?: CmsFooter; statistics: CmsStatistic[] }
export type CmsSection = { __component: string; [key: string]: unknown }
export type CmsPage = { path: string; mode: SiteMode; title: string; description: string; seo?: CmsSEO; navigation?: CmsNavigationItem[]; footer?: CmsFooter; updatedAt?: string; sections: CmsSection[] }

const industryMedia = [
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85',
]

export function getCmsContent(mode: SiteMode = 'india'): CmsContent {
  const site = siteSettings[mode]
  return {
    mode,
    settings: {
      mode,
      heroEyebrow: site.eyebrow,
      heroTitle: site.title,
      heroIntro: site.intro,
      heroCta: site.cta,
      heroImageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=2200&q=85',
      statementTitle: 'Good advice changes the quality of a decision.',
      statementIntro: 'We work where the stakes are high, the path is not obvious and the answer needs to hold up in the real world.',
      aboutTitle: 'Built in India. Trusted worldwide.',
      aboutText: 'We are a homegrown professional services firm with a global outlook. For over 40 years, we have helped businesses navigate complexity, seize opportunities and build a future of confidence.',
      aboutImageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1400&q=85',
      presenceTitle: 'Close to the context. Connected to the world.',
      presenceText: 'Our teams bring local conviction and international perspective to every mandate.',
      careersTitle: 'Bring your curiosity. Leave a mark.',
      careersText: 'We are drawn to people who ask better questions, care about the answer and know that the best work is made together.',
      careersImageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85',
      newsletterTitle: 'Ideas worth your inbox.',
      footerSignature: 'Driven with purpose: serve the society with utmost attention and care.',
      contactEmail: 'connect@igasglobal.com',
      contactPhone: '+91 22 4000 0000',
    },
    services,
    industries: industries.map((industry, index) => ({ ...industry, media: { src: industryMedia[index % industryMedia.length], alt: `${industry.title} sector context` } })),
    articles: articles.map((article) => ({ ...article, media: { src: typeof article.image === 'string' ? article.image : article.image?.url || '', alt: `${article.title} editorial image` }, demo: true })),
    jobs: jobs.map((job) => ({ ...job, shortDescription: '', employmentType: job.type, applicationStatus: 'open' as const, mode })),
    offices: offices.map((office) => ({ ...office, name: office.city, slug: office.city.toLowerCase().replace(/\s+/g, '-'), mode, address: office.detail })),
    leadership: [],
    navigation: [],
    footer: undefined,
    statistics: stats.map((stat, index) => ({ ...stat, detail: ['Across key markets.', 'Connected local teams.', 'Specialist depth.', 'Independent leadership.', 'Built over four decades.'][index] || 'IGAS perspective.' })),
  }
}

export function getCmsSettings(mode: SiteMode = 'india') { return siteSettings[mode] }
