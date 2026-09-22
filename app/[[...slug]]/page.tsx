import { AboutPage, DetailPage, HomePage, ListingPage, NotFoundPage } from '@/components/igas-site'
import { CmsPage } from '@/components/cms-page'
import { LeadershipDetailPage, LeadershipListingPage, OfficeDetailPage } from '@/components/cms-directory-pages'
import { ContactPage } from '@/components/contact-page'
import { getArticle, getIndustry, getJob, getService } from '@/lib/igas-data'
import { getStrapiContent, getStrapiPage } from '@/lib/strapi'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { absoluteUrl, siteName } from '@/lib/site-url'
import { CmsChromeProvider } from '@/components/igas-site'
import type { ReactElement } from 'react'
import { headers } from 'next/headers'
import { modeForHostname } from '@/lib/site-url'

async function requestMode(pathname: string) {
  return modeForHostname((await headers()).get('host'), pathname)
}

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': { title: 'Independent advisory for consequential decisions', description: 'IGAS helps leaders, institutions and investors navigate complexity across India and the world.' },
  '/global': { title: 'Global perspective, local conviction', description: 'IGAS Global connects senior judgment and local insight across markets.' },
  '/about': { title: 'About IGAS', description: 'Learn how IGAS combines rigorous thinking, sector depth and practical momentum.' },
  '/leadership': { title: 'Leadership', description: 'Meet the senior team behind IGAS perspective and independent advice.' },
  '/contact': { title: 'Contact IGAS', description: 'Start a conversation about the decision in front of you.' },
  '/services': { title: 'What we do', description: 'Explore IGAS advisory services for complex, consequential decisions.' },
  '/industries': { title: 'Where we focus', description: 'Explore the industries where IGAS brings deep context and wider perspective.' },
  '/latest-thinking': { title: 'Latest thinking', description: 'Read IGAS perspectives on strategy, markets and business.' },
  '/careers': { title: 'Careers', description: 'Do work with consequence at IGAS.' },
  '/offices': { title: 'Our presence', description: 'Meet the IGAS teams close to the context.' },
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const pathname = '/' + ((await params).slug || []).join('/')
  const mode = await requestMode(pathname)
  const cmsPage = await getStrapiPage(pathname, mode)
  if (cmsPage?.seo) {
    const seo = cmsPage.seo
    return { title: seo.metaTitle || cmsPage.title, description: seo.metaDescription || cmsPage.description, robots: seo.noIndex ? { index: false, follow: false } : undefined, alternates: { canonical: seo.canonicalUrl || absoluteUrl(pathname, mode) }, openGraph: { title: seo.ogTitle || seo.metaTitle || cmsPage.title, description: seo.ogDescription || seo.metaDescription || cmsPage.description, url: seo.canonicalUrl || absoluteUrl(pathname, mode), type: 'website', images: seo.ogImage?.src ? [{ url: seo.ogImage.src, alt: seo.ogImage.alt }] : undefined } }
  }
  const cmsContent = await getStrapiContent(mode)
  const slug = pathname.split('/').pop() || ''
  const item = pathname.startsWith('/services/') ? (cmsContent.services.find((entry) => entry.slug === slug) || getService(slug)) : pathname.startsWith('/industries/') ? (cmsContent.industries.find((entry) => entry.slug === slug) || getIndustry(slug)) : pathname.startsWith('/latest-thinking/') ? (cmsContent.articles.find((entry) => entry.slug === slug) || getArticle(slug)) : pathname.startsWith('/careers/') ? (cmsContent.jobs.find((entry) => entry.slug === slug) || getJob(slug)) : null
  const itemSeo = item && 'seo' in item && item.seo && typeof item.seo === 'object' ? item.seo as { metaTitle?: string; metaDescription?: string; canonicalUrl?: string; noIndex?: boolean; ogTitle?: string; ogDescription?: string; ogImage?: { src: string; alt: string } } : undefined
  const meta = item ? { title: item.title, description: 'description' in item ? item.description : 'excerpt' in item ? item.excerpt : `Join IGAS as a ${item.type.toLowerCase()} team member.` } : pageMeta[pathname] || { title: 'Page not found', description: 'The requested IGAS page could not be found.' }
  return { title: itemSeo?.metaTitle || meta.title, description: itemSeo?.metaDescription || meta.description, robots: itemSeo?.noIndex ? { index: false, follow: false } : undefined, alternates: { canonical: itemSeo?.canonicalUrl || absoluteUrl(pathname, mode) }, openGraph: { title: itemSeo?.ogTitle || `${meta.title} | ${siteName}`, description: itemSeo?.ogDescription || meta.description, url: itemSeo?.canonicalUrl || absoluteUrl(pathname, mode), type: 'website', images: itemSeo?.ogImage?.src ? [{ url: itemSeo.ogImage.src, alt: itemSeo.ogImage.alt }] : undefined } }
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const pathname = '/' + ((await params).slug || []).join('/')
  const mode = await requestMode(pathname)
  const cmsPage = await getStrapiPage(pathname, mode)
  if (cmsPage) return <CmsPage page={cmsPage} />
  const content = await getStrapiContent(mode)
  const withChrome = (page: ReactElement) => <CmsChromeProvider navigation={content.navigation} footer={content.footer}>{page}</CmsChromeProvider>
  if (pathname === '/') return withChrome(<HomePage mode="india" content={content} />)
  if (pathname === '/global') return withChrome(<HomePage mode="global" content={content} />)
  if (pathname === '/about') return withChrome(<AboutPage />)
  if (pathname === '/leadership' && content.leadership.length) return withChrome(<LeadershipListingPage profiles={content.leadership} mode={mode} />)
  if (pathname === '/leadership') return withChrome(<DetailPage eyebrow="Who we are" title="The people behind the perspective." description="Meet the senior team bringing judgment, sector depth and international experience to the decisions that matter." />)
  if (pathname === '/contact') return withChrome(<ContactPage content={content} />)
  if (pathname === '/services') return withChrome(<ListingPage type="services" content={content} />)
  if (pathname === '/industries') return withChrome(<ListingPage type="industries" content={content} />)
  if (pathname === '/latest-thinking') return withChrome(<ListingPage type="insights" content={content} />)
  if (pathname === '/careers') return withChrome(<ListingPage type="careers" content={content} />)
  if (pathname === '/offices') return withChrome(<ListingPage type="offices" content={content} />)
  const slug = pathname.split('/').pop() || ''
  const leadership = pathname.startsWith('/leadership/') && content.leadership.find((profile) => profile.slug === slug)
  if (leadership) return withChrome(<LeadershipDetailPage profile={leadership} mode={mode} />)
  const office = pathname.startsWith('/offices/') && content.offices.find((item) => item.slug === slug)
  if (office) return withChrome(<OfficeDetailPage office={office} mode={mode} />)
  const service = pathname.startsWith('/services/') && (content.services.find((item) => item.slug === slug) || getService(slug))
  if (service) return withChrome(<DetailPage eyebrow="What we do" title={service.title} description={service.shortDescription || service.description} content={service.fullContent} path={pathname} />)
  const industry = pathname.startsWith('/industries/') && (content.industries.find((item) => item.slug === slug) || getIndustry(slug))
  if (industry) return withChrome(<DetailPage eyebrow="Where we focus" title={industry.title} description={industry.shortDescription || industry.description} content={industry.fullContent} path={pathname} />)
  const article = pathname.startsWith('/latest-thinking/') && content.articles.find((item) => item.slug === slug)
  if (article) return withChrome(<DetailPage eyebrow={`${article.category} · ${article.date}`} title={article.title} description={article.excerpt} content={article.content} path={pathname} />)
  const job = pathname.startsWith('/careers/') && (content.jobs.find((item) => item.slug === slug) || getJob(slug))
  if (job) { const jobShortDescription = 'shortDescription' in job && typeof job.shortDescription === 'string' ? job.shortDescription : ''; const jobDescription = 'description' in job && Array.isArray(job.description) ? job.description : undefined; return withChrome(<DetailPage eyebrow={`Careers · ${job.location}`} title={job.title} description={jobShortDescription || `Join IGAS as a ${job.type.toLowerCase()} team member, bringing curiosity and judgment to complex decisions.`} content={jobDescription} path={pathname} />) }
  notFound()
}
