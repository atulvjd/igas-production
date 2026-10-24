'use client'

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, ChevronDown, Clock3, Globe2, Handshake, LoaderCircle, MapPin, Menu, Search, Users, X } from 'lucide-react'
import type { ArticleContentBlock, SiteMode } from '@/lib/igas-data'
import { createEmptyCmsContent, type CmsContent, type CmsFooter, type CmsMedia, type CmsNavigationItem, type CmsRelatedItem } from '@/lib/cms-content'
import { BreadcrumbSchema, OrganizationSchema } from '@/components/seo-structured-data'
import { RichText } from '@/components/rich-text'
import { ArticleListing } from '@/components/article-listing'
import { articleHeadings, readingMinutes } from '@/lib/article-content'
import { useDialogFocus } from '@/components/use-dialog-focus'

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')
const mediaUrl = (media?: string | { url: string }) => typeof media === 'string' ? media : media?.url || ''
const CmsChromeContext = createContext<{ navigation: CmsNavigationItem[]; footer?: CmsFooter; content?: CmsContent }>({ navigation: [] })
export function CmsChromeProvider({ children, navigation, footer, content }: { children: React.ReactNode; navigation: CmsNavigationItem[]; footer?: CmsFooter; content?: CmsContent }) { return <CmsChromeContext.Provider value={{ navigation, footer, content }}>{children}<CookieBanner settings={content?.settings || createEmptyCmsContent().settings} /></CmsChromeContext.Provider> }

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div data-motion-section className={cx('reveal', className)}>{children}</div>
}

function CountUp({ value }: { value: string }) {
  const [count, setCount] = useState<string | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    setCount(null)
    const match = value.match(/^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/)
    if (!match || !ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const numeric = Number(match[2].replace(/,/g, ''))
    const decimals = match[2].split('.')[1]?.length || 0
    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 900, 1)
        setCount(progress === 1 ? value : `${match[1]}${(numeric * (1 - (1 - progress) ** 3)).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: match[2].includes(',') })}${match[3]}`)
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: 0.3 })
    observer.observe(ref.current)
    return () => { observer.disconnect(); cancelAnimationFrame(frame) }
  }, [value])
  return <span ref={ref}>{count ?? value}</span>
}

function Logo({ mode, media }: { mode: SiteMode; media?: { src: string; alt: string } }) { return <Link href={mode === 'global' ? '/global' : '/'} className="logo" aria-label={`IGAS ${mode} home`}><img className="logo-image" width={900} height={300} src={media?.src || '/igas-logo.svg?v=2'} alt={media?.alt || 'IGAS'} /><span className="sr-only">{mode === 'global' ? 'Global' : 'India'}</span></Link> }

function ContentLink({ href, external, className, onClick, children }: { href: string; external?: boolean; className?: string; onClick?: () => void; children: React.ReactNode }) {
  const isExternal = external ?? /^(https?:|mailto:|tel:)/i.test(href)
  return isExternal
    ? <a href={href} className={className} onClick={onClick} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}</a>
    : <Link href={href} className={className} onClick={onClick}>{children}</Link>
}

export function Header({ mode, navigation = [] }: { mode: SiteMode; navigation?: CmsNavigationItem[] }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)
  useDialogFocus(open, mobileRef)
  useEffect(() => {
    if (!activeMenu) return
    const dismiss = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) setActiveMenu(null) }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [activeMenu])
  const chrome = useContext(CmsChromeContext)
  const emptyContent = useMemo(() => createEmptyCmsContent(mode), [mode])
  const content = chrome.content ?? emptyContent
  const allNavigation = (navigation.length ? navigation : chrome.navigation).filter((item) => item.visible)
  const menuItems = allNavigation.filter((item) => item.menuType === 'header')
  const mobileItems = allNavigation.filter((item) => item.menuType === 'mobile')
  const menuFor = (section: CmsContent['settings']['megaMenus'][number]['section']) => content.settings.megaMenus.find((menu) => menu.section === section)!
  const sectionItems = (section: string) => menuItems.filter((item) => item.group === section || item.parentGroup === section || item.group === menuFor(section as CmsContent['settings']['megaMenus'][number]['section']).label)
  const linksFor = (section: string, fallback: Array<{ title: string; href: string; external?: boolean }>) => {
    const records = sectionItems(section)
    return records.length ? records.map((item) => ({ title: item.label, href: item.href, external: item.external })) : fallback
  }
  const peopleNavigation = menuItems.filter((item) => item.group === 'who-we-are' || item.group === menuFor('who-we-are').label)
  const headerCta = menuItems.find((item) => item.cta)
  const headerGroups = [
    { section: 'what-we-do' as const, label: menuFor('what-we-do').label, links: linksFor('what-we-do', content.services.map((service) => ({ title: service.title, href: `/services/${service.slug}` })) ) },
    { section: 'where-we-focus' as const, label: menuFor('where-we-focus').label, links: linksFor('where-we-focus', content.focusAreas.map((area) => ({ title: area.title, href: `/industries#${area.slug}` })) ) },
    { section: 'who-we-are' as const, label: menuFor('who-we-are').label, links: peopleNavigation.map((item) => ({ title: item.label, href: item.href, external: item.external })) },
    { section: 'latest-thinking' as const, label: menuFor('latest-thinking').label, links: linksFor('latest-thinking', content.articles.map((article) => ({ title: article.title, href: `/latest-thinking/${article.slug}` }))) },
  ]
  const mobileGroups = mobileItems.length
    ? [...new Set(mobileItems.map((item) => item.group))].map((group) => ({ label: group, links: mobileItems.filter((item) => item.group === group) }))
    : headerGroups.map((group) => ({ label: group.label, links: group.links.map((link) => ({ label: link.title, href: link.href, external: link.external })) }))
  const careersMenu = menuFor('careers')
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); setSearch(false); setActiveMenu(null) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  const toggleMenu = (label: string) => setActiveMenu((current) => current === label ? null : label)
  return <>
    <header ref={headerRef} className="site-header" onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActiveMenu(null) }}><div className="header-brand"><Logo mode={mode} media={mode === 'global' ? content.settings.globalLogo || content.settings.logo : content.settings.logo} />{content.settings.footerSignature && <p className="header-brand-description">{content.settings.footerSignature}</p>}</div><nav className="desktop-nav" aria-label="Main navigation">{headerGroups.map((group) => { const hasMegaMenu = group.section !== 'where-we-focus'; return <div className={cx('nav-group', group.section === 'where-we-focus' && 'nav-group-focus', hasMegaMenu && 'nav-group-mega')} key={group.section}><button className="nav-trigger" aria-haspopup="true" aria-expanded={activeMenu === group.label} onClick={() => toggleMenu(group.label)}>{group.label}<ChevronDown size={13} /></button>{group.section === 'where-we-focus' ? <FocusMenu content={content} onClose={() => setActiveMenu(null)} /> : <SectionMegaMenu content={content} items={menuItems} section={group.section} onClose={() => setActiveMenu(null)} />}</div> })}</nav><div className="header-actions">{careersMenu.label && <ContentLink className="primary-careers-link" href={careersMenu.ctaHref || '/careers'}>{careersMenu.label}</ContentLink>}<button className="icon-button" aria-label={content.settings.searchLabel || 'Search'} onClick={() => { setOpen(false); setActiveMenu(null); setSearch(true) }}><Search size={18} /></button>{(headerCta?.label || content.settings.contactCtaLabel) && <ContentLink className="header-cta" href={headerCta?.href || content.settings.contactCtaHref || '/contact'} external={headerCta?.external}>{headerCta?.label || content.settings.contactCtaLabel} <ArrowUpRight size={15} /></ContentLink>}<button className="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></header>
    {open && <div ref={mobileRef} className="mobile-panel" id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Site navigation" tabIndex={-1}><div className="mobile-panel-inner"><button className="mobile-panel-close icon-button" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button><p className="eyebrow">{mode === 'global' ? 'Global' : 'India'} / Navigation</p>{mobileGroups.map((group) => <div key={group.label} className="mobile-group"><p>{group.label}</p>{group.links.map((link) => <ContentLink key={link.href} href={link.href} external={link.external} onClick={() => setOpen(false)}>{link.label}<ArrowUpRight size={16} /></ContentLink>)}{!mobileItems.length && group.label === menuFor('where-we-focus').label && <MobileFocusLinks content={content} onClose={() => setOpen(false)} />}</div>)}{content.jobs.length > 0 && <div className="mobile-group"><p>{careersMenu.label}</p>{content.jobs.map((job) => <Link key={job.slug} href={`/careers/${job.slug}`} onClick={() => setOpen(false)}>{job.title}<ArrowUpRight size={16} /></Link>)}</div>}{(headerCta?.label || content.settings.contactCtaLabel) && <ContentLink className="button button-dark" href={headerCta?.href || content.settings.contactCtaHref || '/contact'} external={headerCta?.external} onClick={() => setOpen(false)}>{headerCta?.label || content.settings.contactCtaLabel} <ArrowUpRight size={16} /></ContentLink>}</div></div>}
    {search && <SearchOverlay content={content} onClose={() => setSearch(false)} />}
  </>
}

function FocusMenu({ content, onClose }: { content: CmsContent; onClose: () => void }) {
  const menu = content.settings.megaMenus.find((item) => item.section === 'where-we-focus')!
  const thinkingMenu = content.settings.megaMenus.find((item) => item.section === 'latest-thinking')
  const categories: Array<{ title: string; slug: string; description: string; industries: Array<{ title: string; slug: string }> }> = content.focusAreas.map((area) => ({ ...area, industries: area.industries }))
  const groupedSlugs = new Set(categories.flatMap((category) => category.industries.map((industry) => industry.slug)))
  const remainingIndustries = content.industries.filter((industry) => !groupedSlugs.has(industry.slug))
  if (remainingIndustries.length) categories.push({ title: 'More industries', slug: 'more-industries', description: '', industries: remainingIndustries })
  const [activeCategory, setActiveCategory] = useState(0)
  const group = categories[activeCategory] || categories[0]
  return <div className="nav-menu focus-menu"><div className="focus-menu-intro"><p className="eyebrow">{menu.label}</p><h2>{menu.title}</h2><p>{menu.description}</p>{menu.ctaLabel && <ContentLink className="focus-menu-explore" href={menu.ctaHref} onClick={onClose}>{menu.ctaLabel} <ArrowUpRight size={15} /></ContentLink>}</div><div className="focus-menu-groups"><div className="focus-category-list">{categories.map((item, index) => <button className={cx('focus-category-trigger', activeCategory === index && 'is-active')} key={item.slug} type="button" aria-expanded={activeCategory === index} onClick={() => setActiveCategory(index)}><span>{item.title}</span><ChevronDown size={15} /></button>)}</div><div className="focus-category-panel">{group ? <><p className="eyebrow">{group.title}</p>{group.description && <p className="mega-section-description">{group.description}</p>}{group.industries.map((industry) => <Link key={industry.slug} href={`/industries/${industry.slug}`} onClick={onClose}>{industry.title}<ArrowUpRight size={14} /></Link>)}</> : null}</div></div>{content.articles.length > 0 && <div className="focus-menu-studies"><p className="eyebrow">{thinkingMenu?.label}</p>{content.articles.slice(0, 3).map((article) => <Link key={article.slug} href={`/latest-thinking/${article.slug}`} onClick={onClose}><span>{article.category}</span><strong>{article.title}</strong><small>{article.date}</small></Link>)}<ContentLink className="focus-menu-see-all" href={thinkingMenu?.ctaHref || '/latest-thinking'} onClick={onClose}>{thinkingMenu?.ctaLabel}<ArrowUpRight size={15} /></ContentLink></div>}</div>
}

type MegaMenuLink = { title: string; href: string; description?: string; external?: boolean }
type MegaMenuSection = { title: string; description: string; links: MegaMenuLink[] }

function SectionMegaMenu({ content, items, section, onClose }: { content: CmsContent; items: CmsNavigationItem[]; section: 'what-we-do' | 'who-we-are' | 'latest-thinking'; onClose: () => void }) {
  const menu = content.settings.megaMenus.find((item) => item.section === section)!
  const thinkingCategories = [...new Set(content.articles.map((article) => article.category))]
  const isThinking = section === 'latest-thinking'
  const peopleItems = items.filter((item) => item.group === 'who-we-are' || item.group === menu.label)
  const sections: MegaMenuSection[] = section === 'what-we-do'
    ? content.services.map((service) => ({ title: service.title, description: service.description, links: [{ title: `Explore ${service.title}`, href: `/services/${service.slug}` }] }))
    : isThinking
      ? thinkingCategories.map((category) => {
        const categoryArticles = content.articles.filter((article) => article.category === category)
        return {
          title: category,
          description: categoryArticles[0]?.excerpt || '',
          links: categoryArticles.map((article) => ({ title: article.title, href: `/latest-thinking/${article.slug}`, description: article.date })),
        }
      })
      : peopleItems.length
        ? [...new Set(peopleItems.map((item) => item.parentGroup || 'More about IGAS'))].map((title) => {
          const links = peopleItems.filter((item) => (item.parentGroup || 'More about IGAS') === title)
          return { title, description: links.find((item) => item.description)?.description || '', links: links.map((item) => ({ title: item.label, href: item.href, external: item.external })) }
        })
      : []
  const [activeIndex, setActiveIndex] = useState(0)
  const activeSection = sections[activeIndex]
  const sidebarLinks: MegaMenuLink[] = isThinking
    ? items.filter((item) => item.group !== section).slice(0, 3).map((item) => ({ title: item.label, href: item.href, description: item.description, external: item.external }))
    : content.articles.slice(0, 3).map((article) => ({ title: article.title, href: `/latest-thinking/${article.slug}`, description: `${article.category} · ${article.date}` }))
  return <div className="nav-menu mega-nav-menu">
    <div className="focus-menu-intro"><p className="eyebrow">{menu.label}</p><h2>{menu.title}</h2><p>{menu.description}</p>{menu.ctaLabel && <ContentLink className="focus-menu-explore" href={menu.ctaHref} onClick={onClose}>{menu.ctaLabel}<ArrowUpRight size={15} /></ContentLink>}</div>
    <div className="focus-menu-groups"><div className="focus-category-list">{sections.map((section, index) => <button className={cx('focus-category-trigger', activeIndex === index && 'is-active')} key={section.title} type="button" aria-expanded={activeIndex === index} onClick={() => setActiveIndex(index)}><span>{section.title}</span><ChevronDown size={15} /></button>)}</div><div className="focus-category-panel">{activeSection && <><p className="eyebrow">{activeSection.title}</p><p className="mega-section-description">{activeSection.description}</p>{activeSection.links.map((link) => <ContentLink key={link.href} href={link.href} external={link.external} onClick={onClose}>{link.title}<ArrowUpRight size={14} /></ContentLink>)}</>}</div></div>
    <div className="focus-menu-studies"><p className="eyebrow">{isThinking ? 'Explore IGAS' : 'Latest thinking'}</p>{sidebarLinks.map((link) => <ContentLink key={link.href} href={link.href} external={link.external} onClick={onClose}><span>{link.description}</span><strong>{link.title}</strong></ContentLink>)}<ContentLink className="focus-menu-see-all" href={isThinking ? '/contact' : '/latest-thinking'} onClick={onClose}>{isThinking ? 'Start a conversation' : 'See all'}<ArrowUpRight size={15} /></ContentLink></div>
  </div>
}

function MobileFocusLinks({ content, onClose }: { content: CmsContent; onClose: () => void }) { const grouped = new Set(content.focusAreas.flatMap((area) => area.industries.map((industry) => industry.slug))); const remaining = content.industries.filter((industry) => !grouped.has(industry.slug)); const groups = [...content.focusAreas.map((area) => ({ slug: area.slug, title: area.title, industries: area.industries })), ...(remaining.length ? [{ slug: 'more-industries', title: 'More industries', industries: remaining }] : [])]; return <div className="mobile-focus-links">{groups.map((group) => <details key={group.slug} className="mobile-focus-group"><summary>{group.title}<ChevronDown size={15} /></summary><div>{group.industries.map((industry) => <Link key={industry.slug} href={`/industries/${industry.slug}`} onClick={onClose}>{industry.title}<ArrowUpRight size={16} /></Link>)}{group.industries.length === 0 && <Link href={`/industries#${group.slug}`} onClick={onClose}>Explore this focus <ArrowUpRight size={16} /></Link>}</div></details>)}</div> }

function SearchOverlay({ content, onClose }: { content: CmsContent; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const headingId = useId()
  const hintId = useId()
  useDialogFocus(true, dialogRef)
  useEffect(() => {
    const viewport = window.visualViewport
    const syncViewport = () => {
      overlayRef.current?.style.setProperty('--search-height', `${viewport?.height || window.innerHeight}px`)
      overlayRef.current?.style.setProperty('--search-top', `${viewport?.offsetTop || 0}px`)
    }
    syncViewport()
    viewport?.addEventListener('resize', syncViewport)
    viewport?.addEventListener('scroll', syncViewport)
    return () => {
      viewport?.removeEventListener('resize', syncViewport)
      viewport?.removeEventListener('scroll', syncViewport)
    }
  }, [])
  const quickLinks = [
    { title: 'About IGAS', href: '/about', detail: 'Our purpose and approach', category: 'Company' },
    { title: 'Our services', href: '/services', detail: 'Explore our professional services', category: 'Services' },
    { title: 'Latest thinking', href: '/latest-thinking', detail: 'Ideas and business perspectives', category: 'Insights' },
    { title: 'Contact us', href: '/contact', detail: 'Start a conversation with IGAS', category: 'Contact' },
  ]
  const entries = useMemo(() => {
    const items = [
      ...content.services.map(item => ({ title: item.title, href: `/services/${item.slug}`, detail: item.shortDescription || item.description, category: 'Service' })),
      ...content.industries.map(item => ({ title: item.title, href: `/industries/${item.slug}`, detail: item.shortDescription || item.description, category: 'Industry' })),
      ...content.focusAreas.map(item => ({ title: item.title, href: `/industries#${item.slug}`, detail: item.description, category: 'Focus area' })),
      ...content.articles.map(item => ({ title: item.title, href: `/latest-thinking/${item.slug}`, detail: item.excerpt, category: 'Insight' })),
      ...content.jobs.map(item => ({ title: item.title, href: `/careers/${item.slug}`, detail: `${item.department || ''} ${item.location}`, category: 'Career' })),
      ...content.offices.map(item => ({ title: item.name, href: `/offices/${item.slug}`, detail: `${item.city} ${item.country}`, category: 'Office' })),
      ...content.leadership.map(item => ({ title: item.name, href: `/leadership/${item.slug}`, detail: item.position, category: 'Leadership' })),
      ...content.pages.map(item => ({ title: item.title, href: item.path, detail: item.description, category: 'Page' })),
    ]
    return [...new Map(items.map(item => [item.href, item])).values()]
  }, [content])
  const needle = query.trim().toLocaleLowerCase()
  const results = needle ? [...entries, ...quickLinks.filter(link => !entries.some(entry => entry.href === link.href))]
    .filter(entry => `${entry.title} ${entry.detail} ${entry.category}`.toLocaleLowerCase().includes(needle))
    .sort((a, b) => Number(b.title.toLocaleLowerCase().includes(needle)) - Number(a.title.toLocaleLowerCase().includes(needle))) : []
  const suggestions = [...entries.filter(item => item.category === 'Service').slice(0, 3), ...entries.filter(item => item.category === 'Industry').slice(0, 2)]
  const clear = () => { setQuery(''); inputRef.current?.focus() }
  return <div ref={overlayRef} className="search-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }} role="dialog" aria-modal="true" aria-labelledby={headingId}>
    <div ref={dialogRef} className="search-card" tabIndex={-1}>
      <div className="search-head"><div><p className="eyebrow">Find your next step</p><h2 id={headingId}>{content.settings.searchLabel || 'Search IGAS'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close search"><X size={21} /></button></div>
      <form className="search-input-row" role="search" onSubmit={event => { event.preventDefault(); if (needle) resultsRef.current?.querySelector<HTMLAnchorElement>('a')?.click() }}>
        <Search size={21} aria-hidden="true" /><label className="sr-only" htmlFor={`${headingId}-input`}>Search the IGAS website</label>
        <input ref={inputRef} id={`${headingId}-input`} type="search" autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search" aria-describedby={hintId} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'ArrowDown' && results.length) { event.preventDefault(); resultsRef.current?.querySelector<HTMLAnchorElement>('a')?.focus() } }} placeholder={content.settings.searchPlaceholder || 'Search services, industries and insights'} />
        {query && <button type="button" className="search-clear icon-button" onClick={clear} aria-label="Clear search"><X size={17} /></button>}
      </form>
      <p className="search-hint" id={hintId} role="status">{needle ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query.trim()}”` : 'Explore a topic below, or type to find something specific.'}</p>
      <div className="search-body" ref={resultsRef}>
        {needle ? <div className="search-results">{results.length ? results.map(result => <Link className="search-result" href={result.href} key={result.href} onClick={onClose}><span className="search-result-copy"><span className="search-result-category">{result.category}</span><strong>{result.title}</strong>{result.detail && <span className="search-result-detail">{result.detail}</span>}</span><ArrowUpRight size={18} aria-hidden="true" /></Link>) : <div className="search-no-results"><Search size={26} aria-hidden="true" /><h3>No matches yet</h3><p>Try a shorter phrase, such as tax, audit or healthcare.</p><button className="text-button" type="button" onClick={clear}>Clear and try again</button></div>}</div> : <>
          {suggestions.length > 0 && <section className="search-suggestions" aria-label="Suggested topics"><h3>Suggested topics</h3><div>{suggestions.map(item => <Link href={item.href} key={item.href} onClick={onClose}>{item.title}<ArrowUpRight size={13} aria-hidden="true" /></Link>)}</div></section>}
          <section className="search-quick-links" aria-label="Explore IGAS"><h3>Explore IGAS</h3><div>{quickLinks.map(link => <Link href={link.href} key={link.href} onClick={onClose}><span><strong>{link.title}</strong><small>{link.detail}</small></span><ArrowUpRight size={17} aria-hidden="true" /></Link>)}</div></section>
        </>}
      </div>
    </div>
  </div>
}


function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) { return <div className="section-label"><span>{index}</span><span>{children}</span></div> }
function EmptyState({ label }: { label: string }) { return <div className="empty-state-panel"><p className="eyebrow">Nothing here yet</p><p>{label}</p></div> }
function ArrowLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) { return <Link className={cx('arrow-link', light && 'arrow-link-light')} href={href}>{children}<ArrowUpRight size={17} /></Link> }

function Hero({ settings }: { settings: CmsContent['settings'] }) {
  const image = settings.heroImage?.src || settings.heroImageUrl
  if (!settings.heroTitle && !settings.heroIntro && !settings.heroCta && !image) return null
  return <section className={cx('hero', !image && 'hero-without-image')}>
    <div className="hero-content"><p className="eyebrow">{settings.heroEyebrow}</p><h1>{settings.heroTitle}</h1><p className="hero-intro">{settings.heroIntro}</p><div className="hero-actions">{settings.heroCta && <ContentLink href={settings.heroCtaHref || '/contact'} className="button button-dark">{settings.heroCta}<ArrowUpRight size={17} /></ContentLink>}{settings.aboutCtaLabel && <ArrowLink href={settings.aboutCtaHref || '/about'}>{settings.aboutCtaLabel}</ArrowLink>}</div></div>
    {image && <div className="hero-visual"><img className="hero-photo" src={image} alt={settings.heroImage?.alt || 'Business collaboration and planning'} fetchPriority="high" /><div className="hero-image-caption"><span className="hero-caption-mark" aria-hidden="true"><span /><span /><span /><span /></span><p>{settings.footerSignature}</p></div></div>}
  </section>
}


function StatsSection({ content }: { content: CmsContent }) { if (!content.settings.statementTitle && !content.settings.statementIntro && !content.statistics.length) return null; return <Reveal><section className="stats-section container"><div className="section-cross" aria-hidden="true"><span /><span /></div><SectionLabel index="01">A point of view</SectionLabel><div className="statement-grid"><h2>{content.settings.statementTitle}</h2><div><p className="lead">{content.settings.statementIntro}</p>{content.settings.statementCtaLabel && <ArrowLink href={content.settings.statementCtaHref || '/about'}>{content.settings.statementCtaLabel}</ArrowLink>}</div></div><div className="stats-grid">{content.statistics.map((stat, index) => <div className={`stat stat-${index + 1}`} key={stat.label}><div className="stat-topline"><span className="stat-index">0{index + 1}</span><span className="stat-icon" aria-hidden="true">{[<Globe2 key="globe" />, <MapPin key="pin" />, <Users key="users" />, <Handshake key="handshake" />, <Clock3 key="clock" />][index]}</span></div><strong><CountUp value={stat.value} /></strong><span>{stat.label}</span><p>{stat.detail}</p></div>)}</div></section></Reveal> }

function ServicesSection({ content }: { content: CmsContent }) {
  const menu = content.settings.megaMenus.find(item => item.section === 'what-we-do')!
  if (!content.services.length) return null
  return <section className="container services-section"><div className="services-layout"><div className="services-intro"><SectionLabel index="02">{menu.label}</SectionLabel>{menu.title && <h2>{menu.title}</h2>}{menu.description && <p className="lead">{menu.description}</p>}{menu.ctaLabel && <ArrowLink href={menu.ctaHref}>{menu.ctaLabel}</ArrowLink>}</div><div className="service-list">{content.services.map((service, index) => <Link className="service-row" href={`/services/${service.slug}`} key={service.slug}>{service.media?.src && <div className="service-card-photo"><img src={service.media.src} alt={service.media.alt || service.title} loading="lazy" /></div>}<div className="service-card-body"><div className="service-card-topline"><span className="service-number">{String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={20} aria-hidden="true" /></div><h3>{service.title}</h3><p>{service.shortDescription || service.description}</p></div></Link>)}</div></div></section>
}


function IndustriesSection({ content }: { content: CmsContent }) {
  const menu = content.settings.megaMenus.find(item => item.section === 'where-we-focus')!
  if (!content.industries.length) return null
  return <section className="container industries-section"><SectionLabel index="03">{menu.label}</SectionLabel><div className="section-heading">{menu.title && <h2>{menu.title}</h2>}<div>{menu.description && <p className="lead">{menu.description}</p>}{menu.ctaLabel && <ArrowLink href={menu.ctaHref}>{menu.ctaLabel}</ArrowLink>}</div></div><div className="industry-card-grid">{content.industries.map((industry, index) => <Link href={`/industries/${industry.slug}`} className="sector-card" key={industry.slug}><div className="sector-image">{industry.media?.src && <img src={industry.media.src} alt={industry.media.alt || industry.title} loading="lazy" />}<span>{String(index + 1).padStart(2, '0')}</span></div><div className="sector-copy"><h3>{industry.title}</h3><ArrowUpRight size={19} aria-hidden="true" /></div></Link>)}</div></section>
}


function InsightsCarousel({ content }: { content: CmsContent }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)
  const [pageHidden, setPageHidden] = useState(false)
  const slides = content.articles
  const total = slides.length
  const current = total ? active % total : 0
  const menu = content.settings.megaMenus.find((item) => item.section === 'latest-thinking')!
  const playing = !paused && !hovered && !focused && !reducedMotion && !pageHidden && total > 1

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => setReducedMotion(preference.matches)
    const syncVisibility = () => setPageHidden(document.hidden)
    syncMotion()
    syncVisibility()
    preference.addEventListener('change', syncMotion)
    document.addEventListener('visibilitychange', syncVisibility)
    return () => {
      preference.removeEventListener('change', syncMotion)
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % total), 5000)
    return () => window.clearTimeout(timer)
  }, [playing, active, total])

  if (!total) return null
  const move = (direction: number) => setActive((index) => (index + direction + total) % total)

  return <section className="insights-carousel-section" role="region" aria-roledescription="carousel" aria-label={menu.label || 'Latest thinking'}>
    <div className="container"><div className="insights-carousel-card"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
      <div className="carousel-heading"><div><p className="eyebrow">{menu.label}</p><h2>{menu.title}</h2></div>{menu.ctaLabel && <ArrowLink href={menu.ctaHref}>{menu.ctaLabel}</ArrowLink>}</div>
      <div className="insights-carousel-viewport" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
        <div className="insights-carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {slides.map((article, index) => <div className="carousel-slide" key={article.slug}
            role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${total}`}
            aria-hidden={index !== current} inert={index !== current}>
            <div className="carousel-slide-image" role="img" aria-label={article.media.alt || article.title} style={article.media.src ? { backgroundImage: `url("${article.media.src}")` } : undefined} />
            <div className="carousel-slide-copy"><div className="article-meta"><span>{article.category}</span><span>{article.date}</span></div><h3>{article.title}</h3><p>{article.excerpt}</p><ArrowLink href={`/latest-thinking/${article.slug}`}>Read more</ArrowLink></div>
          </div>)}
        </div>
      </div>
      {total > 1 && <div className="carousel-controls">
        {!reducedMotion && <button type="button" className="carousel-playback" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Play article carousel' : 'Pause article carousel'}>{paused ? 'Play' : 'Pause'}<span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span></button>}
        <button type="button" className="icon-button" onClick={() => move(-1)} aria-label="Previous article">←</button>
        <span className="carousel-position">{String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <button type="button" className="icon-button" onClick={() => move(1)} aria-label="Next article">→</button>
      </div>}
    </div></div>
  </section>
}


function CareersSection({ content }: { content: CmsContent }) { const menu = content.settings.megaMenus.find((item) => item.section === 'careers')!; const image = content.settings.careersImage?.src || content.settings.careersImageUrl; if (!content.settings.careersTitle && !content.settings.careersText && !menu.title && !menu.description && !image) return null; return <section className="careers-section container"><div className="careers-copy"><SectionLabel index="06">{menu.label}</SectionLabel>{(content.settings.careersTitle || menu.title) && <h2>{content.settings.careersTitle || menu.title}</h2>}{(content.settings.careersText || menu.description) && <p className="lead">{content.settings.careersText || menu.description}</p>}{menu.ctaLabel && <ArrowLink href={menu.ctaHref || '/careers'}>{menu.ctaLabel}</ArrowLink>}</div><div className="careers-image" style={image ? { backgroundImage: `url('${image}')` } : undefined} /></section> }

function AboutStorySection({ settings }: { settings: CmsContent['settings'] }) { const image = settings.aboutImage?.src || settings.aboutImageUrl; if (!settings.aboutTitle && !settings.aboutText && !settings.aboutCtaLabel && !image) return null; return <section className="about-story container"><div className="story-copy"><SectionLabel index="01A">Our story</SectionLabel>{settings.aboutTitle && <h2>{settings.aboutTitle}</h2>}{settings.aboutText && <p className="lead">{settings.aboutText}</p>}{settings.aboutCtaLabel && <ArrowLink href={settings.aboutCtaHref || '/about'}>{settings.aboutCtaLabel}</ArrowLink>}</div><div className="story-image" style={image ? { backgroundImage: `linear-gradient(90deg, #172F5D22, transparent), url('${image}')` } : undefined} /></section> }
function LeadershipPresenceSection({ content }: { content: CmsContent }) { const menu = content.settings.megaMenus.find((item) => item.section === 'who-we-are')!; const leaders = content.leadership.slice(0, 3); const offices = content.offices.slice(0, 3); const leadershipLink = content.navigation.find((item) => item.href === '/leadership'); const officeLink = content.navigation.find((item) => item.href === '/offices'); if (!leaders.length && !offices.length && !menu.title && !menu.description) return null; return <section className="leadership-presence dark-section"><div className="container presence-feature"><div className="presence-lead"><SectionLabel index="04">{menu.label}</SectionLabel>{menu.title && <h2>{menu.title}</h2>}{menu.description && <p className="lead">{menu.description}</p>}</div><div className="presence-panels">{leaders.length > 0 && <article className="presence-panel presence-panel-lead"><div className="leaders-image" style={leaders[0]?.media?.src ? { backgroundImage: `url('${leaders[0].media.src}')` } : undefined} /><div className="presence-panel-copy"><SectionLabel index="04A">{leadershipLink?.group || ''}</SectionLabel><h3>{leaders.map((leader) => leader.name).join(' · ')}</h3><p>{leaders[0]?.position || ''}</p>{leadershipLink && <ArrowLink href={leadershipLink.href} light>{leadershipLink.label}</ArrowLink>}</div></article>}{offices.length > 0 && <article className="presence-panel presence-panel-world">{offices[0]?.media?.src ? <div className="presence-office-photo"><img src={offices[0].media.src} alt={offices[0].media.alt || 'Illustrative business setting'} loading="lazy" /></div> : <div className="world-map" aria-label="" />}<div className="presence-panel-copy"><SectionLabel index="04B">{officeLink?.group || ''}</SectionLabel><h3>{offices.map((office) => office.city).join(' · ')}</h3><p>{offices[0]?.address || offices[0]?.detail || ''}</p>{officeLink && <ArrowLink href={officeLink.href} light>{officeLink.label}</ArrowLink>}</div></article>}</div></div></section> }




function Newsletter({ footer, title }: { footer?: CmsFooter; title?: string }) {
  const emailId = useId()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
      const body = await response.json() as { error?: string }
      if (response.ok) setSent(true)
      else setError(body.error || 'Unable to subscribe right now.')
    } catch {
      setError('We could not reach the server. Check your connection and try again.')
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }
  if (!title && !footer?.newsletterTitle && !footer?.newsletterDescription) return null
  return <div className="newsletter"><div><h3>{title || footer?.newsletterTitle}</h3>{footer?.newsletterDescription && <p>{footer.newsletterDescription}</p>}</div>{sent ? <p className="success-message"><Check size={17} /> {footer?.newsletterSuccess || 'You’re on the list.'}</p> : <form onSubmit={submit} className="newsletter-form" aria-busy={busy}><div className="newsletter-input-row"><label className="sr-only" htmlFor={emailId}>{footer?.emailLabel || 'Email address'}</label><input id={emailId} type="email" autoComplete="email" maxLength={254} required aria-invalid={Boolean(error)} aria-describedby={error ? `${emailId}-error` : undefined} value={email} onChange={(event) => setEmail(event.target.value)} placeholder={footer?.emailPlaceholder || "Your email address"} /><button type="submit" aria-label={busy ? 'Subscribing' : footer?.subscribeLabel || 'Subscribe'} disabled={busy}>{busy ? <LoaderCircle className="interaction-spinner" size={18} aria-hidden="true" /> : <ArrowUpRight size={18} />}</button></div>{error && <p id={`${emailId}-error`} className="form-error newsletter-error" role="alert">{error}</p>}</form>}</div>
}

export function Footer({ mode, footer }: { mode: SiteMode; footer?: CmsFooter }) {
  const chrome = useContext(CmsChromeContext)
  const resolvedFooter = footer || chrome.footer
  const footerItems = chrome.navigation.filter((item) => item.menuType === 'footer' && item.visible)
  const footerGroups = footerItems.length
    ? footerItems.reduce<Array<{ label: string; links: Array<{ title: string; href: string; external: boolean }> }>>((groups, item) => {
      const group = groups.find((entry) => entry.label === item.group)
      if (group) group.links.push({ title: item.label, href: item.href, external: item.external })
      else groups.push({ label: item.group, links: [{ title: item.label, href: item.href, external: item.external }] })
      return groups
    }, [])
    : resolvedFooter?.columns?.length
      ? resolvedFooter.columns.map(column => ({ label: column.heading, links: column.links.map(link => ({ title: link.label, href: link.href, external: link.external })) }))
    : [
      ...(resolvedFooter?.usefulLinks.length ? [{ label: 'Explore IGAS', links: resolvedFooter.usefulLinks.map(({ label, href, external }) => ({ title: label, href, external })) }] : []),
    ]
  const logo = mode === 'global' ? chrome.content?.settings.globalLogo || chrome.content?.settings.logo : chrome.content?.settings.logo
  const contact = resolvedFooter?.contactEmail || chrome.content?.settings.contactEmail
  const socialLinks = resolvedFooter?.socialLinks || []
  const legalLinks = resolvedFooter?.legalLinks || []
  const signature = resolvedFooter?.signature || chrome.content?.settings.footerSignature
  const newsletterTitle = resolvedFooter?.newsletterTitle || chrome.content?.settings.newsletterTitle
  const services = chrome.content?.services || []
  const offices = chrome.content?.offices || []
  const phone = resolvedFooter?.contactPhone || chrome.content?.settings.contactPhone
  const linkedHrefs = new Set(footerGroups.flatMap(group => group.links.map(link => link.href)))
  for (const [label, items, prefix] of [
    ['Our services', services, '/services/'],
  ] as const) {
    const links = items.filter(item => !linkedHrefs.has(`${prefix}${item.slug}`)).slice(0, 4).map(item => ({ title: item.title, href: `${prefix}${item.slug}`, external: false }))
    links.push({ title: 'All services', href: '/services', external: false })
    if (links.length) footerGroups.push({ label, links })
  }
  return <footer className="footer">
    <div className="container">
      <div className="footer-main">
        <div className="footer-firm">
          <div className="footer-logo-surface"><Logo mode={mode} media={logo} /></div>
          {signature && <p className="footer-firm-description">{signature}</p>}
          <div className="footer-contact"><h2>Get in touch</h2>{contact && <a href={`mailto:${contact}`}>{contact}</a>}{phone && <a href={`tel:${phone}`}>{phone}</a>}<Link href="/contact">Send an enquiry <ArrowUpRight size={14} /></Link>{offices.length > 0 && <div className="footer-city-links">{offices.map(office => <Link href={`/offices/${office.slug}`} key={office.slug}>{office.city}</Link>)}</div>}</div>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">{footerGroups.map((group) => <div key={group.label}><h2>{group.label}</h2>{(group.label === 'Legal' ? group.links : group.links.slice(0, 5)).map((link) => <Link href={link.href} key={`${group.label}-${link.href}`} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>{link.title}</Link>)}</div>)}</nav>
      </div>
      <Newsletter footer={resolvedFooter} title={newsletterTitle} />
      <div className="footer-bottom"><span>{resolvedFooter?.copyright || `© ${new Date().getFullYear()} IGAS`}</span>{socialLinks.length > 0 && <div className="footer-social-links">{socialLinks.map((link) => <a href={link.href} key={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}</div>}{legalLinks.length > 0 && <div className="footer-legal-links">{legalLinks.map((link) => <Link href={link.href} key={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>{link.label}</Link>)}</div>}<a href="#main-content">Back to top ↑</a></div>
    </div>
  </footer>
}

const CONSENT_COOKIE = 'igas-consent'
const CONSENT_EVENT = 'igas-consent-change'

function hasAnalyticsConsent() {
  return typeof document !== 'undefined' && document.cookie.split('; ').some((cookie) => cookie === `${CONSENT_COOKIE}=analytics` || cookie === `${CONSENT_COOKIE}=all`)
}

function saveConsent(analytics: boolean) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${analytics ? 'analytics' : 'essential'}; max-age=31536000; path=/; SameSite=Lax${secure}`
  window.dispatchEvent(new Event(CONSENT_EVENT))
}

function CookieBanner({ settings }: { settings: CmsContent['settings'] }) {
  const [choiceKnown, setChoiceKnown] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)

  useEffect(() => {
    setChoiceKnown(document.cookie.split('; ').some((cookie) => cookie.startsWith(`${CONSENT_COOKIE}=`)))
    setAnalyticsAllowed(hasAnalyticsConsent())
  }, [])

  const choose = (analytics: boolean) => {
    saveConsent(analytics)
    setAnalyticsAllowed(analytics)
    setChoiceKnown(true)
    setPreferencesOpen(false)
  }
  const openPreferences = () => {
    setAnalyticsAllowed(hasAnalyticsConsent())
    setPreferencesOpen(true)
  }
  const title = settings.cookieTitle || 'Cookie preferences'
  const description = settings.cookieDescription || 'Choose whether to allow analytics. Your choice is saved on this device and can be changed later.'

  if (choiceKnown && !preferencesOpen) {
    return <button className="cookie-settings-button" type="button" onClick={openPreferences}>{settings.cookieManageLabel || 'Cookie preferences'}</button>
  }

  return <aside className="cookie-banner" aria-label={title}>
    <div>
      <p className="eyebrow">{title}</p>
      <p>{description}</p>
      {preferencesOpen && <div className="cookie-options">
        <label><input type="checkbox" checked={analyticsAllowed} onChange={(event) => setAnalyticsAllowed(event.currentTarget.checked)} /> {settings.cookieAnalyticsLabel || 'Allow analytics'}</label>
      </div>}
    </div>
    <div className="cookie-actions">
      {preferencesOpen
        ? <button className="button button-light" type="button" onClick={() => choose(analyticsAllowed)}>Save preferences</button>
        : <>
          <button className="button button-light" type="button" onClick={() => choose(true)}>{settings.cookieAcceptLabel || 'Allow analytics'}</button>
          <button className="text-button" type="button" onClick={() => choose(false)}>{settings.cookieRejectLabel || 'Essential only'}</button>
          <button className="text-button" type="button" onClick={openPreferences}>{settings.cookieManageLabel || 'Manage preferences'}</button>
        </>}
    </div>
  </aside>
}

export function HomePage({ mode = 'india', content = createEmptyCmsContent() }: { mode?: SiteMode; content?: CmsContent }) { return <div className="igas-site"><Header mode={mode} navigation={content.navigation} /><OrganizationSchema /><main id="main-content" tabIndex={-1}><Hero settings={content.settings} /><StatsSection content={content} /><AboutStorySection settings={content.settings} /><ServicesSection content={content} /><IndustriesSection content={content} /><InsightsCarousel content={content} /><LeadershipPresenceSection content={content} /><CareersSection content={content} /></main><Footer mode={mode} footer={content.footer} /></div> }

export function ListingPage({ type, content }: { type: 'services' | 'industries' | 'insights' | 'careers' | 'offices'; content: CmsContent }) {
  const mode = content.mode
  const section = type === 'services' ? 'what-we-do' : type === 'industries' ? 'where-we-focus' : type === 'insights' ? 'latest-thinking' : type === 'careers' ? 'careers' : undefined
  const menu = section ? content.settings.megaMenus.find((item) => item.section === section) : undefined
  const eyebrow = menu?.label || ''
  const title = type === 'careers' ? content.settings.careersTitle || menu?.title || menu?.label : type === 'offices' ? content.settings.presenceTitle || 'Our presence' : menu?.title || menu?.label
  const intro = type === 'careers' ? content.settings.careersText || menu?.description : type === 'offices' ? content.settings.presenceText : menu?.description
  const groupedIndustrySlugs = new Set(content.focusAreas.flatMap((area) => area.industries.map((industry) => industry.slug)))
  const ungroupedIndustries = content.industries.filter((industry) => !groupedIndustrySlugs.has(industry.slug))
  return <div className="igas-site"><Header mode={mode} /><main id="main-content" tabIndex={-1} className="inner-page"><div className="container page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{intro && <p className="lead">{intro}</p>}</div>
    {type === 'services' && <div className="container listing-grid service-directory">{content.services.length ? content.services.map(item => <Link className="listing-card dark-card service-directory-card" href={`/services/${item.slug}`} key={item.slug}>{item.media?.src && <div className="listing-card-photo"><img src={item.media.src} alt={item.media.alt || item.title} loading="lazy" /></div>}<div className="service-directory-body">{item.tag && <span className="service-directory-tag">{item.tag}</span>}<h2>{item.title}</h2>{(item.shortDescription || item.description) && <p>{item.shortDescription || item.description}</p>}<span className="service-directory-action">Explore service <ArrowUpRight size={18} aria-hidden="true" /></span></div></Link>) : <EmptyState label="Services will appear here when published." />}</div>}
    {type === 'industries' && <div className="container listing-grid">{content.focusAreas.map((area) => <article className="listing-card" id={area.slug} key={area.slug}>{(() => { const image = content.industries.find(industry => area.industries.some(item => item.slug === industry.slug) && industry.media?.src)?.media; return image?.src ? <div className="listing-card-photo"><img src={image.src} alt={image.alt || area.title} loading="lazy" /></div> : null })()}<span>{eyebrow}</span><h2>{area.title}</h2>{area.description && <p>{area.description}</p>}<div className="focus-area-industries">{area.industries.map((industry) => <Link key={industry.slug} href={`/industries/${industry.slug}`}>{industry.title}<ArrowUpRight size={14} /></Link>)}</div></article>)}{ungroupedIndustries.map((item) => <Link className="listing-card" href={`/industries/${item.slug}`} key={item.slug}>{item.media?.src && <div className="listing-card-photo"><img src={item.media.src} alt={item.media.alt || item.title} loading="lazy" /></div>}<span>{item.title}</span><h2>{item.title}</h2>{(item.shortDescription || item.description) && <p>{item.shortDescription || item.description}</p>}<ArrowUpRight /></Link>)}{!content.industries.length && !content.focusAreas.length && <EmptyState label="Industries will appear here when published." />}</div>}
    {type === 'insights' && <div className="container inner-articles">{content.articles.length ? <ArticleListing articles={content.articles} /> : <EmptyState label="Articles will appear here when published." />}</div>}
    {type === 'offices' && <div className="container offices-grid">{content.offices.length ? content.offices.map((office) => <Link href={`/offices/${office.slug}`} className="office-tile" key={office.slug}>{office.media?.src && <div className="office-card-photo"><img src={office.media.src} alt={office.media.alt || 'Illustrative business setting'} loading="lazy" /></div>}<p className="eyebrow">{office.country}</p><h2>{office.city}</h2><p>{office.address || office.detail}</p><ArrowUpRight /></Link>) : <EmptyState label="Office information will appear here when published." />}</div>}
    {type === 'careers' && <div className="container jobs-list">{(content.settings.careersImage?.src || content.settings.careersImageUrl) && <img className="careers-directory-photo" src={content.settings.careersImage?.src || content.settings.careersImageUrl} alt={content.settings.careersImage?.alt || 'Illustrative workplace collaboration'} />}{content.jobs.length ? content.jobs.map((job) => <Link className="job-row" href={`/careers/${job.slug}`} key={job.slug}><div><span>{job.employmentType}</span><h2>{job.title}</h2></div><p>{job.location}</p><ArrowUpRight /></Link>) : <EmptyState label="There are no open roles at this time." />}</div>}
  </main><Footer mode={mode} /></div>
}

export function NotFoundPage() { return <div className="igas-site"><Header mode="india" /><main id="main-content" tabIndex={-1} className="not-found-page"><div className="container"><p className="eyebrow">404 / Page not found</p><h1>That page has moved<br /><em>or never stood still.</em></h1><p className="lead">The page you are looking for is unavailable. Return to the homepage or explore our services.</p><div className="not-found-actions"><Link className="button button-dark" href="/">Back to home <ArrowUpRight size={16} /></Link><Link className="arrow-link" href="/services">Explore services <ArrowUpRight size={17} /></Link></div></div></main><Footer mode="india" /></div> }

export function DetailPage({ title, description, eyebrow = 'IGAS', content, path = '/', mode = 'india', article = false, author, media, related = [] }: { title: string; description: string; eyebrow?: string; content?: ArticleContentBlock[]; path?: string; mode?: SiteMode; article?: boolean; author?: string; media?: CmsMedia; related?: Array<CmsRelatedItem & { href: string }> }) {
  const settings = useContext(CmsChromeContext).content?.settings
  const headings = articleHeadings(content)
  const relatedLabel = (href: string) => href.startsWith('/latest-thinking/') ? 'Insight' : href.startsWith('/services/') ? 'Service' : href.startsWith('/industries/') ? 'Industry' : 'Leadership'
  return <div className="igas-site"><Header mode={mode} /><BreadcrumbSchema items={[{ name: 'Home', path: '/' }, ...(article ? [{ name: 'Latest thinking', path: '/latest-thinking' }] : []), { name: title, path }]} />
    <main id="main-content" tabIndex={-1} className={cx('detail-page', article && 'article-detail')}>
      <div className="container detail-hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span>{article && <><Link href="/latest-thinking">Latest thinking</Link><span aria-hidden="true">/</span></>}<span aria-current="page">{title}</span></nav>
        <p className="eyebrow">{eyebrow}</p><h1>{title}</h1>
        {description && <p className="lead article-standfirst">{description}</p>}
        {article && <div className="article-reading-meta">{author && <span>By {author}</span>}{content?.length ? <span>{readingMinutes(content)} min read</span> : null}</div>}
        {!article && settings?.contactCtaLabel && <Link className="button button-dark" href={settings.contactCtaHref || '/contact'}>{settings.contactCtaLabel}<ArrowUpRight size={16} /></Link>}
        {media?.src && <figure className="detail-cover"><img src={media.src} alt={media.alt || title} width={media.width} height={media.height} />{media.caption && <figcaption>{media.caption}</figcaption>}</figure>}
      </div>
      {content?.length ? <div className={cx('container detail-body', article && 'article-reading-layout')}>
        {article && headings.length > 0 && <aside className="article-contents"><nav aria-label="In this article"><p className="eyebrow">In this article</p><ol>{headings.map((item) => <li key={item.id} className={item.level > 2 ? 'article-contents-nested' : undefined}><a href={`#${item.id}`}>{item.text}</a></li>)}</ol></nav></aside>}
        <article className="article-reading-body"><RichText content={content} /></article>
      </div> : null}
      {related.length > 0 && <section className="container article-related"><div className="article-related-heading"><p className="eyebrow">Continue exploring</p><h2>Related perspectives and expertise</h2></div><div className="listing-grid">{related.map((item) => <Link className="listing-card" href={item.href} key={item.href}><span className="eyebrow">{relatedLabel(item.href)}</span><h3>{item.title}</h3><ArrowUpRight /></Link>)}</div></section>}
    </main><Footer mode={mode} /></div>
}

export function AboutPage({ content = createEmptyCmsContent() }: { content?: CmsContent }) { const menu = content.settings.megaMenus.find((item) => item.section === 'who-we-are')!; const hasAboutCopy = Boolean(content.settings.aboutTitle || content.settings.aboutText); const hasStory = Boolean(menu.title || menu.description || content.leadership.length || content.offices.length || content.settings.careersText); return <div className="igas-site"><Header mode={content.mode} navigation={content.navigation} /><main id="main-content" tabIndex={-1} className="about-page">{hasAboutCopy ? <><div className="container about-hero"><div><p className="eyebrow">{menu.label}</p>{content.settings.aboutTitle && <h1>{content.settings.aboutTitle}</h1>}{content.settings.aboutText && <p className="lead">{content.settings.aboutText}</p>}</div>{(content.settings.aboutImage?.src || content.settings.aboutImageUrl) && <img className="about-profile-image" src={content.settings.aboutImage?.src || content.settings.aboutImageUrl} alt={content.settings.aboutImage?.alt || 'Illustrative business discussion'} />}</div>{hasStory && <div className="container about-split">{menu.title && <h2>{menu.title}</h2>}<div>{menu.description && <p>{menu.description}</p>}{content.settings.aboutText && <p>{content.settings.aboutText}</p>}<div className="purpose-grid">{content.leadership[0] && <div><span className="eyebrow">Leadership</span><p>{content.leadership[0].position}</p></div>}{content.offices.length > 0 && <div><span className="eyebrow">Our offices</span><p>{content.offices.map((office) => office.city).join(', ')}</p></div>}{content.settings.careersText && <div><span className="eyebrow">Careers</span><p>{content.settings.careersText}</p></div>}</div></div></div>}</> : <div className="container"><EmptyState label="About information will appear here when published." /></div>}</main><Footer mode={content.mode} footer={content.footer} /></div> }
