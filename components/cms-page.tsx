'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Footer, Header } from '@/components/igas-site'
import { ContactForm } from '@/components/contact-page'
import type { ArticleContentBlock, SiteMode } from '@/lib/igas-data'
import type { CmsPage as CmsPageData, CmsSection } from '@/lib/cms-content'

const text = (section: CmsSection, key: string, fallback = '') => typeof section[key] === 'string' ? section[key] as string : fallback
const blocks = (section: CmsSection) => Array.isArray(section.body) ? section.body as ArticleContentBlock[] : []

function RichText({ content }: { content: ArticleContentBlock[] }) {
  return <div className="cms-rich-text">{content.map((block, index) => { const value = (block.children || []).map((child) => child.text || '').join(''); if (!value) return null; if (block.type === 'heading') { const Heading = block.level === 2 ? 'h2' : 'h3'; return <Heading key={index}>{value}</Heading> } if (block.type === 'list') return <ul key={index}><li>{value}</li></ul>; return <p key={index}>{value}</p> })}</div>
}

function CmsCarousel({ section }: { section: CmsSection }) {
  const slides = Array.isArray(section.slides) ? section.slides.filter((slide): slide is CmsSection => Boolean(slide && typeof slide === 'object')) : []
  const [active, setActive] = useState(0)
  if (!slides.length) return null
  const slide = slides[active]
  const href = text(slide, 'href', '/latest-thinking')
  return <section className="cms-carousel-section"><div className="container"><div className="cms-carousel"><p className="eyebrow">{text(section, 'eyebrow', 'Point of view')}</p><div className="cms-carousel-heading"><h2>{text(section, 'title', 'Ideas for the moments that matter.')}</h2><span>{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span></div><div className="cms-carousel-slide"><div className="cms-carousel-image" style={{ backgroundImage: `url('${text(slide, 'imageUrl')}')` }} role="img" aria-label={text(slide, 'imageAlt', text(slide, 'title'))} /><div className="cms-carousel-copy"><div className="article-meta"><span>{text(slide, 'category')}</span><span>{text(slide, 'date')}</span></div><h3>{text(slide, 'title')}</h3><p>{text(slide, 'excerpt')}</p><Link className="arrow-link" href={href}>Read more <ArrowUpRight size={17} /></Link></div></div><div className="cms-carousel-controls"><button type="button" onClick={() => setActive((active - 1 + slides.length) % slides.length)} aria-label="Previous slide">←</button><button type="button" onClick={() => setActive((active + 1) % slides.length)} aria-label="Next slide">→</button></div></div></div></section>
}

function Section({ section }: { section: CmsSection }) {
  const component = section.__component
  if (component === 'shared.hero') return <section className="cms-hero" style={{ backgroundImage: `linear-gradient(90deg, #173b3acc, #173b3a55), url('${text(section, 'imageUrl')}')` }}><div className="container cms-hero-copy"><p className="eyebrow">{text(section, 'eyebrow')}</p><h1>{text(section, 'title')}</h1><p>{text(section, 'intro')}</p>{text(section, 'ctaLabel') && <Link className="button button-light" href={text(section, 'ctaHref', '/contact')}>{text(section, 'ctaLabel')} <ArrowUpRight size={16} /></Link>}</div></section>
  if (component === 'shared.rich-text') return <section className={`cms-rich-section cms-theme-${text(section, 'theme', 'light')}`}><div className="container cms-section-narrow"><p className="eyebrow">{text(section, 'eyebrow')}</p><h2>{text(section, 'title')}</h2><RichText content={blocks(section)} /></div></section>
  if (component === 'shared.image-text') { const image = <div className="cms-image-text-image" style={{ backgroundImage: `url('${text(section, 'imageUrl')}')` }} role="img" aria-label={text(section, 'imageAlt', text(section, 'title'))} />; const copy = <div className="cms-image-text-copy"><p className="eyebrow">{text(section, 'eyebrow')}</p><h2>{text(section, 'title')}</h2><p>{text(section, 'body')}</p>{text(section, 'ctaLabel') && <Link className="arrow-link" href={text(section, 'ctaHref', '/contact')}>{text(section, 'ctaLabel')} <ArrowUpRight size={17} /></Link>}</div>; return <section className="cms-image-text"><div className="container cms-image-text-grid">{text(section, 'imageSide', 'right') === 'left' ? <>{image}{copy}</> : <>{copy}{image}</>}</div></section> }
  if (component === 'shared.stats') { const items = Array.isArray(section.items) ? section.items.filter((item): item is CmsSection => Boolean(item && typeof item === 'object') && (section.items as CmsSection[]).indexOf(item as CmsSection) >= 0).filter((item) => item.active !== false).sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0)) : []; return <section className="cms-stats"><div className="container"><p className="eyebrow">{text(section, 'eyebrow')}</p><h2>{text(section, 'title')}</h2><p className="lead">{text(section, 'intro')}</p><div className="cms-stats-grid">{items.map((item) => <div key={`${text(item, 'value')}-${text(item, 'label')}`}><strong>{text(item, 'value')}{text(item, 'suffix')}</strong><span>{text(item, 'label')}</span><p>{text(item, 'detail')}</p></div>)}</div></div></section> }
  if (component === 'shared.quote') return <section className="footer-quote cms-page-quote"><div className="container"><p className="eyebrow">{text(section, 'eyebrow')}</p><blockquote>“{text(section, 'quote')}”</blockquote>{text(section, 'author') && <cite>— {text(section, 'author')}</cite>}{text(section, 'signature') && <p className="footer-signature">{text(section, 'signature')}</p>}</div></section>
  if (component === 'shared.carousel') return <CmsCarousel section={section} />
  if (component === 'shared.contact-form') return <section className="contact-page cms-contact-section"><div className="container contact-layout"><div><p className="eyebrow">{text(section, 'eyebrow')}</p><h2>{text(section, 'title')}</h2><p className="lead">{text(section, 'intro')}</p><div className="contact-details">{text(section, 'contactEmail') && <a href={`mailto:${text(section, 'contactEmail')}`}>{text(section, 'contactEmail')}</a>}{text(section, 'contactPhone') && <a href={`tel:${text(section, 'contactPhone')}`}>{text(section, 'contactPhone')}</a>}</div></div><ContactForm consentText={text(section, 'consentText')} successMessage={text(section, 'successMessage')} /></div></section>
  if (component === 'shared.cta') return <section className={`cms-cta cms-theme-${text(section, 'theme', 'dark')}`}><div className="container"><p className="eyebrow">{text(section, 'eyebrow')}</p><h2>{text(section, 'title')}</h2><p>{text(section, 'body')}</p>{text(section, 'label') && <Link className="button button-light" href={text(section, 'href', '/contact')}>{text(section, 'label')} <ArrowUpRight size={16} /></Link>}</div></section>
  return null
}

export function CmsPage({ page }: { page: CmsPageData }) { return <div className="igas-site"><Header mode={page.mode as SiteMode} navigation={page.navigation} /><main className="cms-page"><div className="cms-page-intro container"><p className="eyebrow">{page.mode === 'global' ? 'Global' : 'IGAS'}</p><h1>{page.title}</h1>{page.description && <p className="lead">{page.description}</p>}</div>{page.sections.map((section, index) => <Section key={`${section.__component}-${index}`} section={section} />)}</main><Footer mode={page.mode as SiteMode} footer={page.footer} /></div> }
