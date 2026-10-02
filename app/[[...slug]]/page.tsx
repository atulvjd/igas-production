import { ContentUnavailablePage, DetailPage, HomePage, ListingPage, CmsChromeProvider } from '@/components/igas-site'
import { CmsPage } from '@/components/cms-page'
import { LeadershipDetailPage, LeadershipListingPage, OfficeDetailPage } from '@/components/cms-directory-pages'
import { ContactPage as CmsContactPage } from '@/components/contact-page'
import { getStrapiContent, getStrapiPage } from '@/lib/strapi'
import type { CmsSEO, CmsContent } from '@/lib/cms-content'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { absoluteUrl, siteName } from '@/lib/site-url'
import type { ReactElement } from 'react'
import { headers } from 'next/headers'
import { modeForHostname } from '@/lib/site-url'

async function requestMode(pathname: string) { return modeForHostname((await headers()).get('host'), pathname) }
function seoObject(value: unknown): CmsSEO | undefined { return value && typeof value === 'object' ? value as CmsSEO : undefined }
function metadataFor(title: string, description: string, seo: CmsSEO | undefined, url: string, global?: CmsSEO): Metadata {
  const canonical = seo?.canonicalUrl || global?.canonicalUrl || url
  const resolvedTitle = seo?.metaTitle || global?.metaTitle || title || siteName
  const resolvedDescription = seo?.metaDescription || global?.metaDescription || description || undefined
  const noIndex = seo?.noIndex ?? global?.noIndex
  const ogImage = seo?.ogImage || global?.ogImage
  return { title: resolvedTitle, description: resolvedDescription, robots: noIndex ? { index: false, follow: false } : undefined, alternates: { canonical }, openGraph: { title: seo?.ogTitle || global?.ogTitle || resolvedTitle, description: seo?.ogDescription || global?.ogDescription || resolvedDescription, url: canonical, type: 'website', images: ogImage?.src ? [{ url: ogImage.src, alt: ogImage.alt }] : undefined } }
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const pathname = '/' + ((await params).slug || []).join('/')
  const mode = await requestMode(pathname)
  const [page, cms] = await Promise.all([getStrapiPage(pathname, mode), getStrapiContent(mode)])
  const globalSeo = cms.settings.seo
  if (page) return metadataFor(page.title, page.description, page.seo, absoluteUrl(pathname, mode), globalSeo)
  const slug = pathname.split('/').pop() || ''
  const isArticle = pathname.startsWith('/latest-thinking/') || pathname.startsWith('/articles/')
  const item = pathname.startsWith('/services/') ? cms.services.find((entry) => entry.slug === slug)
    : pathname.startsWith('/industries/') ? cms.industries.find((entry) => entry.slug === slug)
      : isArticle ? cms.articles.find((entry) => entry.slug === slug)
        : pathname.startsWith('/careers/') ? cms.jobs.find((entry) => entry.slug === slug)
          : pathname.startsWith('/offices/') ? cms.offices.find((entry) => entry.slug === slug)
            : pathname.startsWith('/leadership/') ? cms.leadership.find((entry) => entry.slug === slug) : undefined
  if (item) {
    const title = 'name' in item ? item.name : item.title
    const descriptionValue = 'excerpt' in item ? item.excerpt : 'shortDescription' in item ? item.shortDescription : 'description' in item ? item.description : 'position' in item ? item.position : ''
    const description = typeof descriptionValue === 'string' ? descriptionValue : ''
    return metadataFor(title, description, seoObject(item.seo), absoluteUrl(pathname, mode), globalSeo)
  }
  const technicalTitle = pathname === '/' || pathname === '/global' ? siteName : pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') || siteName
  return metadataFor(technicalTitle, '', undefined, absoluteUrl(pathname, mode), globalSeo)
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const pathname = '/' + ((await params).slug || []).join('/')
  const mode = await requestMode(pathname)
  const [cmsPage, content] = await Promise.all([getStrapiPage(pathname, mode), getStrapiContent(mode)])
  const withChrome = (page: ReactElement) => <CmsChromeProvider navigation={content.navigation} footer={content.footer}>{page}</CmsChromeProvider>
  if (cmsPage) return <CmsPage page={cmsPage} content={content} />
  if (pathname === '/' || pathname === '/global') return <HomePage mode={mode} content={content} />
  if (pathname === '/about') return <ContentUnavailablePage mode={mode} content={content} />
  if (pathname === '/contact') return content.settings.contactTitle && content.settings.contactConsent ? withChrome(<CmsContactPage content={content} />) : <ContentUnavailablePage mode={mode} content={content} />
  if (pathname === '/leadership') return content.leadership.length ? withChrome(<LeadershipListingPage profiles={content.leadership} mode={mode} />) : <ContentUnavailablePage mode={mode} content={content} />
  if (pathname === '/services') return withChrome(<ListingPage type="services" content={content} />)
  if (pathname === '/industries') return withChrome(<ListingPage type="industries" content={content} />)
  if (pathname === '/latest-thinking' || pathname === '/articles') return withChrome(<ListingPage type="insights" content={content} />)
  if (pathname === '/careers') return withChrome(<ListingPage type="careers" content={content} />)
  if (pathname === '/offices') return withChrome(<ListingPage type="offices" content={content} />)
  const slug = pathname.split('/').pop() || ''
  const leadership = pathname.startsWith('/leadership/') && content.leadership.find((profile) => profile.slug === slug)
  if (leadership) return withChrome(<LeadershipDetailPage profile={leadership} mode={mode} />)
  const office = pathname.startsWith('/offices/') && content.offices.find((item) => item.slug === slug)
  if (office) return withChrome(<OfficeDetailPage office={office} mode={mode} />)
  const service = pathname.startsWith('/services/') && content.services.find((item) => item.slug === slug)
  if (service) return withChrome(<DetailPage mode={mode} eyebrow={service.tag} title={service.title} description={service.shortDescription || service.description} content={service.fullContent} path={pathname} />)
  const industry = pathname.startsWith('/industries/') && content.industries.find((item) => item.slug === slug)
  if (industry) return withChrome(<DetailPage mode={mode} title={industry.title} description={industry.shortDescription || industry.description} content={industry.fullContent} path={pathname} />)
  const article = (pathname.startsWith('/latest-thinking/') || pathname.startsWith('/articles/')) && content.articles.find((item) => item.slug === slug)
  if (article) return withChrome(<DetailPage mode={mode} eyebrow={[article.category, article.date].filter(Boolean).join(' · ')} title={article.title} description={article.excerpt} content={article.content} path={pathname} />)
  const job = pathname.startsWith('/careers/') && content.jobs.find((item) => item.slug === slug && item.applicationStatus === 'open')
  if (job) return withChrome(<DetailPage mode={mode} eyebrow={[job.department, job.location, job.employmentType].filter(Boolean).join(' · ')} title={job.title} description={job.shortDescription} content={job.description} path={pathname} />)
  notFound()
}
