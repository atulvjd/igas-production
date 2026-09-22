export type SiteMode = 'india' | 'global'

export interface SiteSettings { mode: SiteMode; label: string; domain: string; eyebrow: string; title: string; intro: string; cta: string }
export interface Service { title: string; description: string; slug: string; tag: string; shortDescription?: string; fullContent?: ArticleContentBlock[]; mode?: SiteMode; updatedAt?: string; seo?: unknown }
export interface Industry { title: string; description: string; slug: string; shortDescription?: string; fullContent?: ArticleContentBlock[]; mode?: SiteMode; updatedAt?: string; seo?: unknown }
export interface Media { url: string; alt?: string; width?: number; height?: number; caption?: string }
export interface ArticleContentBlock { type: string; level?: number; format?: string; children?: Array<{ type?: string; text?: string }> }
export interface Article { title: string; excerpt: string; category: string; date: string; slug: string; image?: string | Media; content?: ArticleContentBlock[]; author?: string; contentType?: string; featured?: boolean; mode?: SiteMode; updatedAt?: string; seo?: unknown }
export interface Office { city: string; country: string; detail: string }
export interface Job { title: string; location: string; type: string; slug: string }
export interface SEO { title: string; description: string; image?: string }
export interface Page { title: string; slug: string; body?: string; seo?: SEO }
export interface LeadershipProfile { name: string; role: string; bio?: string }
export interface UsefulLink { title: string; href: string }
export interface SiteContent { mode: SiteMode; services: Service[]; industries: Industry[]; articles: Article[]; jobs: Job[]; offices: Office[] }

export const siteSettings: Record<SiteMode, SiteSettings> = {
  india: { mode: 'india', label: 'India', domain: 'igasglobal.com', eyebrow: 'Independent advisory for consequential decisions', title: 'Clarity for the moments that change what comes next.', intro: 'IGAS helps leaders, institutions and investors navigate complexity across India and the world, with advice built to move decisions forward.', cta: 'Start a conversation' },
  global: { mode: 'global', label: 'Global', domain: 'caigas.com', eyebrow: 'Global insight. Local conviction.', title: 'A better view of what comes next.', intro: 'IGAS Global brings strategic intelligence, transactions and transformation together for leaders shaping markets.', cta: 'Explore our thinking' },
}

export const services: Service[] = [
  { title: 'Audit & assurance', description: 'Build trust in the information, controls and decisions your stakeholders rely on.', slug: 'audit-assurance', tag: '01' },
  { title: 'Tax', description: 'Turn tax complexity into a source of clarity, confidence and better capital allocation.', slug: 'tax', tag: '02' },
  { title: 'Consulting', description: 'Turn ambiguity into an executable path forward, grounded in evidence and built for momentum.', slug: 'consulting', tag: '03' },
  { title: 'Forensic', description: 'See around corners, resolve uncertainty and protect the operating core under pressure.', slug: 'forensic', tag: '04' },
  { title: 'Deals', description: 'Make high-stakes investment and portfolio decisions with sharper commercial perspective.', slug: 'deals', tag: '05' },
]

export const industries: Industry[] = [
  { title: 'Manufacturing', description: 'Rebuilding advantage through productivity, resilience and scale.', slug: 'manufacturing' },
  { title: 'Financial services', description: 'Building trust and relevance in a market being remade.', slug: 'financial-services' },
  { title: 'Entertainment', description: 'Creating value in a sector shaped by attention, culture and technology.', slug: 'entertainment' },
  { title: 'Information technology', description: 'Making sense of velocity, convergence and consequence.', slug: 'information-technology' },
  { title: 'Healthcare & pharma', description: 'Creating better outcomes in one of the world’s most vital systems.', slug: 'healthcare-pharma' },
  { title: 'Gold & bullion', description: 'Navigating value, transparency and trust across a complex market.', slug: 'gold-bullion' },
  { title: 'Steel & metal', description: 'Building resilience and advantage across essential industries.', slug: 'steel-metal' },
  { title: 'Sports', description: 'Bringing commercial discipline to high-performance ecosystems.', slug: 'sports' },
  { title: 'Mining', description: 'Balancing productivity, stewardship and long-term value.', slug: 'mining' },
  { title: 'Consumer & retail', description: 'Finding growth where changing expectations create new space.', slug: 'consumer-retail' },
  { title: 'Real estate', description: 'Making long-term value visible in a changing built environment.', slug: 'real-estate' },
  { title: 'Energy & infrastructure', description: 'Navigating the systems behind a more resilient future.', slug: 'energy-infrastructure' },
  { title: 'Education', description: 'Equipping institutions for a more demanding future.', slug: 'education' },
]

export const focusCategories = [
  { title: 'Consumer & Health', slug: 'consumer-health' },
  { title: 'Financial Services', slug: 'financial-services' },
  { title: 'Government & Infrastructure', slug: 'government-infrastructure' },
  { title: 'Industrials & Energy', slug: 'industrials-energy' },
  { title: 'Private Equity', slug: 'private-equity' },
  { title: 'Technology, Media and Entertainment and Telecommunications', slug: 'technology-media-entertainment-telecommunications' },
]

export const focusCategoryGroups = [
  { title: 'Consumer & Health', industries: industries.filter(({ slug }) => ['consumer-retail', 'healthcare-pharma', 'education'].includes(slug)) },
  { title: 'Financial Services', industries: industries.filter(({ slug }) => ['financial-services', 'gold-bullion', 'real-estate'].includes(slug)) },
  { title: 'Government & Infrastructure', industries: industries.filter(({ slug }) => ['energy-infrastructure'].includes(slug)) },
  { title: 'Industrials & Energy', industries: industries.filter(({ slug }) => ['manufacturing', 'steel-metal', 'mining'].includes(slug)) },
  { title: 'Private Equity', industries: [] },
  { title: 'Technology, Media and Entertainment and Telecommunications', industries: industries.filter(({ slug }) => ['entertainment', 'information-technology', 'sports'].includes(slug)) },
]

export const articles: Article[] = [
  { title: 'The next India story will be written in execution', excerpt: 'Five signals for leaders moving from ambition to durable advantage.', category: 'Perspective', date: '18 Aug 2026', slug: 'next-india-story', image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=85' },
  { title: 'What resilient growth looks like now', excerpt: 'The operating choices separating durable growth from temporary momentum.', category: 'Briefing', date: '02 Aug 2026', slug: 'resilient-growth', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85' },
  { title: 'A practical guide to stakeholder alignment', excerpt: 'Why the most important strategy is often the one people can carry.', category: 'Point of view', date: '21 Jul 2026', slug: 'stakeholder-alignment', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85' },
]

export const offices: Office[] = [
  { city: 'Mumbai', country: 'India', detail: 'Bandra Kurla Complex · Asia Pacific' },
  { city: 'New Delhi', country: 'India', detail: 'Connaught Place · National Capital Region' },
]

export const jobs: Job[] = [
  { title: 'Consultant, Strategy & Transformation', location: 'Mumbai / New Delhi', type: 'Full-time', slug: 'consultant-strategy' },
  { title: 'Associate, Transactions & Capital', location: 'Mumbai', type: 'Full-time', slug: 'associate-transactions' },
  { title: 'Research Analyst, Global Insights', location: 'Mumbai / New Delhi', type: 'Full-time', slug: 'research-analyst' },
]

export const taglines = [
  { quote: 'Pride in Service. Confidence in Delivery.', author: 'IGAS India' },
  { quote: 'Financial management is at the heart of any business. It is one area that can help drive it forward.', author: 'IGAS perspective' },
  { quote: 'Beware of little expenses. A small leak will sink a great ship.', author: 'Benjamin Franklin' },
  { quote: 'Planning is bringing the future into the present.', author: 'IGAS perspective' },
]

export const stats = [
  { value: '31', label: 'offices' },
  { value: '19', label: 'cities' },
  { value: '400+', label: 'employees' },
  { value: '38+', label: 'partners' },
  { value: '40+', label: 'years of experience' },
]

export function getSiteMode(hostname = ''): SiteMode { return hostname.includes('caigas') ? 'global' : 'india' }
export function getArticle(slug: string) { return articles.find((article) => article.slug === slug) }
export function getService(slug: string) { return services.find((service) => service.slug === slug) }
export function getIndustry(slug: string) { return industries.find((industry) => industry.slug === slug) }
export function getJob(slug: string) { return jobs.find((job) => job.slug === slug) }

export const navGroups = [
  { label: 'What we do', links: services.map(({ title, slug }) => ({ title, href: `/services/${slug}` })) },
  { label: 'Where we focus', links: focusCategories.map(({ title, slug }) => ({ title, href: `/industries#${slug}` })) },
  { label: 'Who we are', links: [{ title: 'About IGAS', href: '/about' }, { title: 'Leadership', href: '/leadership' }, { title: 'Our offices', href: '/offices' }, { title: 'Careers', href: '/careers' }] },
]

export const usefulLinks = ['Latest thinking', 'Contact', 'Privacy notice', 'Cookie preferences']

export function hrefFor(mode: SiteMode, path: string) { return mode === 'global' ? `https://caigas.com${path}` : path }
