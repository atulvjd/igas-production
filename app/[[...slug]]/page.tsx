import { AboutPage, DetailPage, HomePage, ListingPage, NotFoundPage } from '@/components/igas-site'
import { CmsPage } from '@/components/cms-page'
import { JobDetailPage, LeadershipDetailPage, LeadershipListingPage, OfficeDetailPage } from '@/components/cms-directory-pages'
import { ContactPage } from '@/components/contact-page'
import { getStrapiContent, getStrapiPage } from '@/lib/strapi'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { absoluteUrl, hasSeparateSiteOrigins, modeForHostname } from '@/lib/site-url'
import type { CmsSEO } from '@/lib/cms-content'
import { CmsChromeProvider } from '@/components/igas-site'
import type { ReactElement } from 'react'
import { headers } from 'next/headers'
import { getSingleSegmentSlug, isBuiltInRoute } from '@/lib/routes'

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
  '/articles': { title: 'Articles', description: 'Browse published IGAS articles and perspectives.' },
  '/careers': { title: 'Careers', description: 'Do work with consequence at IGAS.' },
  '/offices': { title: 'Our presence', description: 'Meet the IGAS teams close to the context.' },
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const pathname = '/' + ((await params).slug || []).join('/')
  const mode = pathname === '/global' ? 'global' : await requestMode(pathname)
  const cmsPage = isBuiltInRoute(pathname) ? null : await getStrapiPage(pathname, mode)
  const cmsContent = await getStrapiContent(mode)
  const serviceSlug = getSingleSegmentSlug(pathname, '/services/')
  const industrySlug = getSingleSegmentSlug(pathname, '/industries/')
  const articleSlug = getSingleSegmentSlug(pathname, '/latest-thinking/') || getSingleSegmentSlug(pathname, '/articles/')
  const jobSlug = getSingleSegmentSlug(pathname, '/careers/')
  const officeSlug = getSingleSegmentSlug(pathname, '/offices/')
  const leadershipSlug = getSingleSegmentSlug(pathname, '/leadership/')
  const item = serviceSlug ? cmsContent.services.find((entry) => entry.slug === serviceSlug)
    : industrySlug ? cmsContent.industries.find((entry) => entry.slug === industrySlug)
      : articleSlug ? cmsContent.articles.find((entry) => entry.slug === articleSlug)
        : jobSlug ? cmsContent.jobs.find((entry) => entry.slug === jobSlug)
          : officeSlug ? cmsContent.offices.find((entry) => entry.slug === officeSlug)
            : leadershipSlug ? cmsContent.leadership.find((entry) => entry.slug === leadershipSlug)
              : null
  const itemSeo = item && 'seo' in item && item.seo && typeof item.seo === 'object' ? item.seo as CmsSEO : undefined
  const pageSeo = cmsPage?.seo
  const globalSeo = cmsContent.settings.seo
  const itemDescription = item && 'excerpt' in item ? item.excerpt
    : item && 'shortDescription' in item ? item.shortDescription
      : item && 'description' in item && typeof item.description === 'string' ? item.description
        : item && 'position' in item ? item.position
          : item && 'address' in item ? [item.address, item.city, item.country].filter(Boolean).join(', ')
            : ''
  const itemTitle = item && 'name' in item ? item.name : item?.title
  const meta = cmsPage ? { title: cmsPage.title, description: cmsPage.description } : item ? { title: itemTitle || 'IGAS', description: itemDescription } : pageMeta[pathname] || { title: 'Page not found', description: 'The requested page is unavailable.' }
  const title = pageSeo?.metaTitle || itemSeo?.metaTitle || globalSeo?.metaTitle || meta.title
  const description = pageSeo?.metaDescription || itemSeo?.metaDescription || globalSeo?.metaDescription || meta.description
  const articleCanonicalPath = pathname === '/articles' || pathname.startsWith('/articles/')
    ? pathname.replace(/^\/articles/, '/latest-thinking')
    : pathname
  const defaultCanonicalPath = pathname === '/global' && hasSeparateSiteOrigins() ? '/' : articleCanonicalPath
  const canonical = pageSeo?.canonicalUrl || itemSeo?.canonicalUrl || globalSeo?.canonicalUrl || absoluteUrl(defaultCanonicalPath, mode)
  const ogImage = pageSeo?.ogImage || itemSeo?.ogImage || globalSeo?.ogImage
  const twitterImage = pageSeo?.twitterImage || itemSeo?.twitterImage || globalSeo?.twitterImage
  const noIndex = pageSeo?.noIndex ?? itemSeo?.noIndex ?? globalSeo?.noIndex
  return { title, description, robots: noIndex ? { index: false, follow: false } : undefined, alternates: { canonical }, openGraph: { title: pageSeo?.ogTitle || itemSeo?.ogTitle || globalSeo?.ogTitle || title, description: pageSeo?.ogDescription || itemSeo?.ogDescription || globalSeo?.ogDescription || description, url: canonical, type: 'website', images: ogImage?.src ? [{ url: ogImage.src, alt: ogImage.alt }] : undefined }, twitter: { card: twitterImage?.src ? 'summary_large_image' : 'summary', title: pageSeo?.ogTitle || itemSeo?.ogTitle || globalSeo?.ogTitle || title, description: pageSeo?.ogDescription || itemSeo?.ogDescription || globalSeo?.ogDescription || description, images: twitterImage?.src ? [twitterImage.src] : undefined } }
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const pathname = '/' + ((await params).slug || []).join('/')
  const mode = pathname === '/global' ? 'global' : await requestMode(pathname)
  const cmsPage = isBuiltInRoute(pathname) ? null : await getStrapiPage(pathname, mode)
  if (cmsPage) {
    const content = await getStrapiContent(mode)
    return <CmsChromeProvider navigation={cmsPage.navigation || content.navigation} footer={cmsPage.footer || content.footer} content={content}><CmsPage page={cmsPage} /></CmsChromeProvider>
  }
  const content = await getStrapiContent(mode)
  const withChrome = (page: ReactElement) => <CmsChromeProvider navigation={content.navigation} footer={content.footer} content={content}>{page}</CmsChromeProvider>
  if (pathname === '/') return withChrome(<HomePage mode={mode} content={content} />)
  if (pathname === '/global') {
    const globalContent = mode === 'global' ? content : await getStrapiContent('global')
    return <CmsChromeProvider navigation={globalContent.navigation} footer={globalContent.footer} content={globalContent}><HomePage mode="global" content={globalContent} /></CmsChromeProvider>
  }
  if (pathname === '/about') return withChrome(<AboutPage content={content} />)
  if (pathname === '/leadership' && content.leadership.length) return withChrome(<LeadershipListingPage profiles={content.leadership} mode={mode} />)
  if (pathname === '/leadership') return withChrome(<LeadershipListingPage profiles={[]} mode={mode} />)
  if (pathname === '/contact') return withChrome(<ContactPage content={content} />)
  if (pathname === '/services') return withChrome(<ListingPage type="services" content={content} />)
  if (pathname === '/industries') return withChrome(<ListingPage type="industries" content={content} />)
  if (pathname === '/latest-thinking' || pathname === '/articles') return withChrome(<ListingPage type="insights" content={content} />)
  if (pathname === '/careers') return withChrome(<ListingPage type="careers" content={content} />)
  if (pathname === '/offices') return withChrome(<ListingPage type="offices" content={content} />)
  const leadershipSlug = getSingleSegmentSlug(pathname, '/leadership/')
  const leadership = leadershipSlug && content.leadership.find((profile) => profile.slug === leadershipSlug)
  if (leadership) return withChrome(<LeadershipDetailPage profile={leadership} mode={mode} />)
  const officeSlug = getSingleSegmentSlug(pathname, '/offices/')
  const office = officeSlug && content.offices.find((item) => item.slug === officeSlug)
  if (office) return withChrome(<OfficeDetailPage office={office} mode={mode} />)
  const serviceSlug = getSingleSegmentSlug(pathname, '/services/')
  const service = serviceSlug && content.services.find((item) => item.slug === serviceSlug)
  if (service) return withChrome(<DetailPage eyebrow="What we do" title={service.title} description={service.shortDescription || service.description} content={service.fullContent} media={service.media} path={pathname} mode={mode} related={[...service.relatedIndustries.map((item) => ({ ...item, href: `/industries/${item.slug}` })), ...service.relatedArticles.map((item) => ({ ...item, href: `/latest-thinking/${item.slug}` })), ...service.relatedLeadership.map((item) => ({ ...item, href: `/leadership/${item.slug}` }))]} />)
  const industrySlug = getSingleSegmentSlug(pathname, '/industries/')
  const industry = industrySlug && content.industries.find((item) => item.slug === industrySlug)
  if (industry) return withChrome(<DetailPage eyebrow="Where we focus" title={industry.title} description={industry.shortDescription || industry.description} content={industry.fullContent} media={industry.media} path={pathname} mode={mode} related={[...industry.relatedServices.map((item) => ({ ...item, href: `/services/${item.slug}` })), ...industry.relatedArticles.map((item) => ({ ...item, href: `/latest-thinking/${item.slug}` }))]} />)
  const articleSlug = getSingleSegmentSlug(pathname, '/latest-thinking/') || getSingleSegmentSlug(pathname, '/articles/')
  const article = articleSlug && content.articles.find((item) => item.slug === articleSlug)
  if (article) return withChrome(<DetailPage eyebrow={`${article.category} · ${article.date}`} title={article.title} description={article.excerpt} content={article.content} media={article.media} path={pathname} mode={mode} article author={article.author} related={[...article.relatedArticles.map((item) => ({ ...item, href: `/latest-thinking/${item.slug}` })), ...article.relatedServices.map((item) => ({ ...item, href: `/services/${item.slug}` })), ...article.relatedIndustries.map((item) => ({ ...item, href: `/industries/${item.slug}` }))]} />)
  const jobSlug = getSingleSegmentSlug(pathname, '/careers/')
  const job = jobSlug && content.jobs.find((item) => item.slug === jobSlug)
  if (job) return withChrome(<JobDetailPage job={job} mode={mode} />)
  notFound()
}
