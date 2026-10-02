'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { CookieBanner, Footer, Header } from '@/components/igas-site'
import { ContactForm } from '@/components/contact-page'
import type { ArticleContentBlock, SiteMode } from '@/lib/igas-data'
import type { CmsContent, CmsPage as CmsPageData, CmsSection } from '@/lib/cms-content'

const text = (section: CmsSection, key: string, fallback = '') => typeof section[key] === 'string' ? section[key] as string : fallback
const blocks = (section: CmsSection) => Array.isArray(section.body) ? section.body as ArticleContentBlock[] : []

function CmsCount({ value, suffix }: { value: string; suffix: string }) {
  const target = Number.parseInt(value.replace(/,/g, ''), 10)
  const [count, setCount] = useState(0)
  if (!Number.isFinite(target)) return <>{value}{suffix}</>
  return <CountedNumber target={target} count={count} setCount={setCount} suffix={suffix || (value.includes('+') ? '+' : '')} />
}

function CountedNumber({ target, count, setCount, suffix }: { target: number; count: number; setCount: (value: number) => void; suffix: string }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 900, 1)
        setCount(Math.round(target * (1 - Math.pow(1 - progress, 3))))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: 0.6 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [target, setCount])
  return <strong ref={ref}>{count.toLocaleString()}{suffix}</strong>
}

function RichText({ content }: { content: ArticleContentBlock[] }) {
  return <div className="cms-rich-text">{content.map((block, index) => { const value = (block.children || []).map((child) => child.text || '').join(''); if (!value) return null; if (block.type === 'heading') { const Heading = block.level === 2 ? 'h2' : 'h3'; return <Heading key={index}>{value}</Heading> } if (block.type === 'list') return <ul key={index}><li>{value}</li></ul>; return <p key={index}>{value}</p> })}</div>
}

function CmsCarousel({ section }: { section: CmsSection }) {
  const slides = Array.isArray(section.slides) ? section.slides.filter((slide): slide is CmsSection => Boolean(slide && typeof slide === 'object')) : []
  const [active, setActive] = useState(0)
  if (!slides.length) return null
  const slide = slides[active]
  const href = text(slide, 'href', '/articles')
  return <section className="cms-carousel-section"><div className="container"><div className="cms-carousel">{text(section, 'eyebrow') && <p className="eyebrow">{text(section, 'eyebrow')}</p>}<div className="cms-carousel-heading"><h2>{text(section, 'title')}</h2><span>{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span></div><div className="cms-carousel-slide"><div className="cms-carousel-image" style={{ backgroundImage: `url('${text(slide, 'imageUrl')}')` }} role="img" aria-label={text(slide, 'imageAlt', text(slide, 'title'))} /><div className="cms-carousel-copy"><div className="article-meta"><span>{text(slide, 'category')}</span><span>{text(slide, 'date')}</span></div><h3>{text(slide, 'title')}</h3>{text(slide, 'excerpt') && <p>{text(slide, 'excerpt')}</p>}<Link className="arrow-link" href={href}>Read more <ArrowUpRight size={17} /></Link></div></div><div className="cms-carousel-controls"><button type="button" onClick={() => setActive((active - 1 + slides.length) % slides.length)} aria-label="Previous slide">←</button><button type="button" onClick={() => setActive((active + 1) % slides.length)} aria-label="Next slide">→</button></div></div></div></section>
}

function CollectionListing({ section, content }: { section: CmsSection; content: CmsContent }) {
  const source = text(section, 'source')
  const items: Array<{ title: string; description: string; href: string; image?: string; eyebrow?: string }> = source === 'services' ? content.services.map((item) => ({ title: item.title, description: item.description, href: `/services/${item.slug}`, eyebrow: item.tag }))
    : source === 'industries' ? content.industries.map((item) => ({ title: item.title, description: item.description, href: `/industries/${item.slug}`, image: item.media.src }))
      : source === 'articles' ? content.articles.filter((item) => !section.featuredOnly || item.featured).map((item) => ({ title: item.title, description: item.excerpt, href: `/articles/${item.slug}`, image: item.media.src, eyebrow: item.category }))
        : source === 'jobs' ? content.jobs.filter((item) => item.applicationStatus === 'open').map((item) => ({ title: item.title, description: item.shortDescription, href: `/careers/${item.slug}`, eyebrow: item.location }))
          : source === 'offices' ? content.offices.map((item) => ({ title: item.name, description: item.address || item.detail, href: `/offices/${item.slug}`, eyebrow: item.country, image: item.media?.src }))
            : source === 'leadership' ? content.leadership.map((item) => ({ title: item.name, description: item.position, href: `/leadership/${item.slug}`, eyebrow: item.position, image: item.media?.src })) : []
  const limit = typeof section.limit === 'number' && section.limit > 0 ? Math.min(section.limit, 100) : 6
  const visible = items.slice(0, limit)
  return <section className="cms-collection-listing"><div className="container"><p className="eyebrow">{text(section, 'eyebrow')}</p>{text(section, 'title') && <h2>{text(section, 'title')}</h2>}{text(section, 'intro') && <p className="lead">{text(section, 'intro')}</p>}{visible.length ? <div className="listing-grid">{visible.map((item) => <Link className="listing-card" href={item.href} key={item.href}>{item.image && <div className="article-image" style={{ backgroundImage: `url('${item.image}')` }} />}{item.eyebrow && <span>{item.eyebrow}</span>}<h3>{item.title}</h3>{item.description && <p>{item.description}</p>}<ArrowUpRight /></Link>)}</div> : <p className="empty-state">There are no published records in this collection.</p>}</div></section>
}

function Section({ section, content }: { section: CmsSection; content: CmsContent }) {
  const component = section.__component
  if (component === 'shared.hero') return <section className="cms-hero" style={{ backgroundImage: text(section, 'videoUrl') ? undefined : `linear-gradient(90deg, #173b3acc, #173b3a55), url('${text(section, 'imageUrl')}')` }}>{text(section, 'videoUrl') && <video className="cms-hero-video" src={text(section, 'videoUrl')} autoPlay muted loop playsInline aria-hidden="true" />}<div className="cms-hero-overlay" /><div className="container cms-hero-copy">{text(section, 'eyebrow') && <p className="eyebrow">{text(section, 'eyebrow')}</p>}<h1>{text(section, 'title')}</h1>{text(section, 'intro') && <p>{text(section, 'intro')}</p>}{text(section, 'ctaLabel') && <Link className="button button-light" href={text(section, 'ctaHref', '/contact')}>{text(section, 'ctaLabel')} <ArrowUpRight size={16} /></Link>}</div></section>
  if (component === 'shared.rich-text') return <section className={`cms-rich-section cms-theme-${text(section, 'theme', 'light')}`}><div className="container cms-section-narrow"><p className="eyebrow">{text(section, 'eyebrow')}</p><h2>{text(section, 'title')}</h2><RichText content={blocks(section)} /></div></section>
  if (component === 'shared.image-text') { const image = <div className="cms-image-text-image" style={{ backgroundImage: `url('${text(section, 'imageUrl')}')` }} role="img" aria-label={text(section, 'imageAlt', text(section, 'title'))} />; const copy = <div className="cms-image-text-copy"><p className="eyebrow">{text(section, 'eyebrow')}</p><h2>{text(section, 'title')}</h2><p>{text(section, 'body')}</p>{text(section, 'ctaLabel') && <Link className="arrow-link" href={text(section, 'ctaHref', '/contact')}>{text(section, 'ctaLabel')} <ArrowUpRight size={17} /></Link>}</div>; return <section className="cms-image-text"><div className="container cms-image-text-grid">{text(section, 'imageSide', 'right') === 'left' ? <>{image}{copy}</> : <>{copy}{image}</>}</div></section> }
  if (component === 'shared.stats') { const items = Array.isArray(section.items) ? section.items.filter((item): item is CmsSection => Boolean(item && typeof item === 'object') && item.active !== false).sort((a, b) => (typeof a.sortOrder === 'number' ? a.sortOrder : 0) - (typeof b.sortOrder === 'number' ? b.sortOrder : 0)) : []; return <section className="cms-stats"><div className="container"><p className="eyebrow">{text(section, 'eyebrow')}</p><h2>{text(section, 'title')}</h2><p className="lead">{text(section, 'intro')}</p><div className="cms-stats-grid">{items.map((item) => <div key={`${text(item, 'value')}-${text(item, 'label')}`}><CmsCount value={text(item, 'value')} suffix={text(item, 'suffix')} /><span>{text(item, 'label')}</span><p>{text(item, 'detail')}</p></div>)}</div></div></section> }
  if (component === 'shared.quote-banner') { const items = Array.isArray(section.items) ? section.items.filter((item): item is CmsSection => Boolean(item && typeof item === 'object') && item.active !== false).sort((a, b) => (typeof a.sortOrder === 'number' ? a.sortOrder : 0) - (typeof b.sortOrder === 'number' ? b.sortOrder : 0)) : []; if (!items.length) return null; return <section className="tagline-rail"><div className="container tagline-grid"><p className="eyebrow">{text(section, 'eyebrow')}</p>{items.map((item) => <blockquote className="tagline-card" key={`${text(item, 'sortOrder')}-${text(item, 'quote')}`}><span className="quote-mark">“</span><p>{text(item, 'quote')}</p>{(text(item, 'author') || text(item, 'source')) && <cite>— {[text(item, 'author'), text(item, 'source')].filter(Boolean).join(', ')}</cite>}</blockquote>)}</div></section> }
  if (component === 'shared.carousel') return <CmsCarousel section={section} />
  if (component === 'shared.collection-listing') return <CollectionListing section={section} content={content} />
  if (component === 'shared.contact-form') return <section className="contact-page cms-contact-section"><div className="container contact-layout"><div>{text(section, 'eyebrow') && <p className="eyebrow">{text(section, 'eyebrow')}</p>}{text(section, 'title') && <h2>{text(section, 'title')}</h2>}{text(section, 'intro') && <p className="lead">{text(section, 'intro')}</p>}<div className="contact-details">{text(section, 'contactEmail') && <a href={`mailto:${text(section, 'contactEmail')}`}>{text(section, 'contactEmail')}</a>}{text(section, 'contactPhone') && <a href={`tel:${text(section, 'contactPhone')}`}>{text(section, 'contactPhone')}</a>}</div></div><div>{text(section, 'consentText') ? <ContactForm consentText={text(section, 'consentText')} successMessage={text(section, 'successMessage')} /> : <p className="empty-state">This form is not configured for submissions.</p>}</div></div></section>
  if (component === 'shared.cta') return <section className={`cms-cta cms-theme-${text(section, 'theme', 'dark')}`}><div className="container">{text(section, 'eyebrow') && <p className="eyebrow">{text(section, 'eyebrow')}</p>}<h2>{text(section, 'title')}</h2>{text(section, 'body') && <p>{text(section, 'body')}</p>}{text(section, 'label') && <Link className="button button-light" href={text(section, 'href', '/contact')}>{text(section, 'label')} <ArrowUpRight size={16} /></Link>}</div></section>
  return null
}

export function CmsPage({ page, content }: { page: CmsPageData; content: CmsContent }) { const mode = page.mode as SiteMode; return <div className="igas-site"><Header mode={mode} navigation={page.navigation} /><main className="cms-page"><div className="cms-page-intro container"><p className="eyebrow">{mode === 'global' ? 'Global' : 'IGAS'}</p><h1>{page.title}</h1>{page.description && <p className="lead">{page.description}</p>}</div>{page.sections.map((section, index) => <Section key={`${section.__component}-${index}`} section={section} content={content} />)}</main><Footer mode={mode} footer={page.footer || content.footer} /><CookieBanner settings={content.settings.cookieConsent} /></div> }
