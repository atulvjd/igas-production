'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, ChevronDown, Menu, Search, X } from 'lucide-react'
import type { Article, ArticleContentBlock, SiteMode } from '@/lib/igas-data'
import type { CmsContent, CmsCookieSettings, CmsFooter, CmsNavigationItem } from '@/lib/cms-content'
import { BreadcrumbSchema, OrganizationSchema } from '@/components/seo-structured-data'

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')
const CmsChromeContext = createContext<{ navigation: CmsNavigationItem[]; footer?: CmsFooter }>({ navigation: [] })
export function CmsChromeProvider({ children, navigation, footer }: { children: React.ReactNode; navigation: CmsNavigationItem[]; footer?: CmsFooter }) {
  return <CmsChromeContext.Provider value={{ navigation, footer }}>{children}</CmsChromeContext.Provider>
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { node.classList.add('is-visible'); observer.disconnect() } }, { threshold: 0.12 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={cx('reveal', className)}>{children}</div>
}

function Logo({ mode }: { mode: SiteMode }) {
  return <Link href={mode === 'global' ? '/global' : '/'} className="logo" aria-label={`IGAS ${mode} home`}><img className="logo-image" src="/igas-logo-original.png" alt="IGAS" /><span className="sr-only">{mode === 'global' ? 'Global' : 'India'}</span></Link>
}

function CmsLink({ href, external, children, ...props }: React.ComponentProps<typeof Link> & { external?: boolean }) {
  if (external) return <a href={href.toString()} target="_blank" rel="noreferrer" {...props as React.AnchorHTMLAttributes<HTMLAnchorElement>}>{children}</a>
  return <Link href={href} {...props}>{children}</Link>
}

export function Header({ mode, navigation = [] }: { mode: SiteMode; navigation?: CmsNavigationItem[] }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const chrome = useContext(CmsChromeContext)
  const items = (navigation.length ? navigation : chrome.navigation).filter((item) => item.visible && item.mode === mode)
  const menuItems = items.filter((item) => item.menuType === 'header' && !item.cta).sort((a, b) => a.order - b.order)
  const actions = items.filter((item) => item.menuType === 'header' && item.cta).sort((a, b) => a.order - b.order)
  const groups = menuItems.reduce<Array<{ label: string; links: CmsNavigationItem[] }>>((all, item) => {
    const group = all.find((entry) => entry.label === item.group)
    if (group) group.links.push(item)
    else all.push({ label: item.group, links: [item] })
    return all
  }, [])
  const groupedLinks = (links: CmsNavigationItem[]) => links.reduce<Array<{ heading: string; links: CmsNavigationItem[] }>>((all, item) => {
    const heading = item.parentGroup || ''
    const group = all.find((entry) => entry.heading === heading)
    if (group) group.links.push(item)
    else all.push({ heading, links: [item] })
    return all
  }, [])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); setSearch(false); setActiveMenu(null) } }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  return <>
    <header className="site-header"><Logo mode={mode} /><nav className="desktop-nav">{groups.map((group) => <div className="nav-group" key={group.label}><button className="nav-trigger" aria-haspopup="true" aria-expanded={activeMenu === group.label} onClick={() => setActiveMenu(activeMenu === group.label ? null : group.label)}>{group.label}<ChevronDown size={13} /></button><div className="nav-menu">{groupedLinks(group.links).map((subgroup, index) => <div className="nav-menu-column" key={`${subgroup.heading}-${index}`}>{subgroup.heading && <p className="eyebrow">{subgroup.heading}</p>}{subgroup.links.map((link) => <CmsLink key={link.href} href={link.href} external={link.external} onClick={() => setActiveMenu(null)}>{link.label}<ArrowUpRight size={14} /></CmsLink>)}</div>)}</div></div>)}</nav><div className="header-actions">{actions.map((item, index) => <CmsLink className={index === actions.length - 1 ? 'header-cta' : 'primary-careers-link'} key={item.href} href={item.href} external={item.external}>{item.label}<ArrowUpRight size={15} /></CmsLink>)}<button className="icon-button" aria-label="Search" onClick={() => setSearch(true)}><Search size={18} /></button><button className="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></header>
    {open && <div className="mobile-panel" id="mobile-navigation"><div className="mobile-panel-inner">{groups.map((group) => <div key={group.label} className="mobile-group"><p>{group.label}</p>{groupedLinks(group.links).map((subgroup, index) => <div key={`${subgroup.heading}-${index}`}>{subgroup.heading && <p>{subgroup.heading}</p>}{subgroup.links.map((link) => <CmsLink key={link.href} href={link.href} external={link.external} onClick={() => setOpen(false)}>{link.label}<ArrowUpRight size={16} /></CmsLink>)}</div>)}</div>)}{actions.map((item) => <CmsLink className="button button-dark" key={item.href} href={item.href} external={item.external} onClick={() => setOpen(false)}>{item.label}<ArrowUpRight size={16} /></CmsLink>)}</div></div>}
    {search && <SearchOverlay mode={mode} onClose={() => setSearch(false)} />}
  </>
}

function SearchOverlay({ onClose, mode }: { onClose: () => void; mode: SiteMode }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ title: string; description: string; href: string; type: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) { setResults([]); setLoading(false); setError(false); return }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true); setError(false)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}&mode=${mode}`, { signal: controller.signal })
        const body = await response.json() as { results?: typeof results }
        if (!response.ok) throw new Error('Search unavailable')
        setResults(body.results || [])
      } catch { if (!controller.signal.aborted) { setResults([]); setError(true) } }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }, 180)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query, mode])
  return <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Site search"><div className="search-card"><div className="search-head"><span>Search</span><button className="icon-button" onClick={onClose} aria-label="Close search"><X size={18} /></button></div><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the site" />{query.trim().length >= 2 && <div className="search-results" aria-live="polite">{loading ? <p className="empty-state">Searching…</p> : error ? <p className="empty-state" role="alert">Search is temporarily unavailable. Please try again.</p> : results.length ? results.map((result) => <Link href={result.href} key={result.href} onClick={onClose}><span>{result.title}<small>{result.type}</small></span><ArrowUpRight size={16} /></Link>) : <p className="empty-state">No published results found.</p>}</div>}</div></div>
}

function EmptyState({ label, unavailable = false }: { label: string; unavailable?: boolean }) { return <div className="empty-state-panel"><p className="eyebrow">{unavailable ? 'Content temporarily unavailable' : 'No published content'}</p><p>{label}</p></div> }
function ArrowLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) { return <Link className={cx('arrow-link', light && 'arrow-link-light')} href={href}>{children}<ArrowUpRight size={17} /></Link> }

function Newsletter({ footer }: { footer?: CmsFooter }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!footer?.newsletterTitle) return null
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
      const body = await response.json() as { error?: string }
      if (response.ok) setSent(true); else setError(body.error || 'Subscription could not be completed.')
    } catch { setError('Subscription could not be completed. Please try again.') }
    finally { setBusy(false) }
  }
  return <div className="newsletter"><div><p className="eyebrow">{footer.newsletterEyebrow}</p><h3>{footer.newsletterTitle}</h3>{footer.newsletterDescription && <p>{footer.newsletterDescription}</p>}</div>{sent ? <p className="success-message"><Check size={17} /> {footer.newsletterSuccess}</p> : <form onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">{footer.emailLabel}</label><input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={footer.emailPlaceholder} /><button aria-label={footer.subscribeLabel} disabled={busy}><ArrowUpRight size={18} /></button>{error && <span className="form-error" role="alert">{error}</span>}</form>}</div>
}

export function Footer({ mode, footer }: { mode: SiteMode; footer?: CmsFooter }) {
  const chrome = useContext(CmsChromeContext)
  const resolved = footer || chrome.footer
  if (!resolved) return <footer className="footer"><div className="container footer-main"><Logo mode={mode} /></div></footer>
  const columns = resolved.columns.length ? resolved.columns : [
    { heading: resolved.usefulHeading || '', order: 0, links: resolved.usefulLinks },
    { heading: resolved.legalHeading || '', order: 1, links: resolved.legalLinks },
  ].filter((column) => column.heading && column.links.length)
  return <footer className="footer">
    {(resolved.quote || resolved.signature) && <div className="footer-quote"><div className="container">{resolved.quote && <><blockquote>“{resolved.quote}”</blockquote>{resolved.quoteAuthor && <cite>— {resolved.quoteAuthor}</cite>}</>}{resolved.signature && <p className="footer-signature">{resolved.signature}</p>}</div></div>}
    <div className="container"><Newsletter footer={resolved} /><div className="footer-main"><div className="footer-logo-surface"><Logo mode={mode} /></div><div className="footer-links">{[...columns].sort((a, b) => a.order - b.order).map((column) => <div key={`${column.order}-${column.heading}`}><p>{column.heading}</p>{[...column.links].sort((a, b) => a.order - b.order).map((link) => <CmsLink href={link.href} external={link.external} key={link.href}>{link.label}</CmsLink>)}</div>)}{(resolved.contactEmail || resolved.contactPhone) && <div>{resolved.contactHeading && <p>{resolved.contactHeading}</p>}{resolved.contactEmail && <a href={`mailto:${resolved.contactEmail}`}>{resolved.contactEmail}</a>}{resolved.contactPhone && <a href={`tel:${resolved.contactPhone}`}>{resolved.contactPhone}</a>}</div>}</div></div>
      <div className="footer-bottom">{resolved.copyright && <span>{resolved.copyright}</span>}{resolved.legalHeading && <span>{resolved.legalHeading}</span>}<div>{[...resolved.legalLinks].sort((a, b) => a.order - b.order).map((link) => <CmsLink href={link.href} external={link.external} key={link.href}>{link.label}</CmsLink>)}</div><div>{[...resolved.socialLinks].sort((a, b) => a.order - b.order).map((link) => <a href={link.href} key={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}</div></div>
    </div>
  </footer>
}

export function CookieBanner({ settings }: { settings?: CmsCookieSettings }) {
  const [visible, setVisible] = useState(false)
  const [preferences, setPreferences] = useState(false)
  useEffect(() => { if (settings?.enabled && settings.title && settings.description) setVisible(!document.cookie.includes('igas-consent=')) }, [settings?.enabled, settings?.title, settings?.description])
  const dismiss = (choice: string) => { document.cookie = `igas-consent=${choice}; max-age=31536000; path=/; SameSite=Lax`; setVisible(false) }
  if (!visible || !settings?.enabled || !settings.title || !settings.description) return null
  return <aside className="cookie-banner" aria-label={settings.title}><div><p className="eyebrow">{settings.title}</p><p>{settings.description}</p>{preferences && <div className="cookie-options"><label><input type="checkbox" defaultChecked disabled /> {settings.essentialLabel}</label><label><input type="checkbox" /> {settings.analyticsLabel}</label><label><input type="checkbox" /> {settings.marketingLabel}</label></div>}{settings.privacyHref && <Link href={settings.privacyHref}>{settings.privacyLabel}</Link>}</div><div className="cookie-actions"><button className="button button-light" onClick={() => dismiss('all')}>{settings.acceptLabel}</button><button className="text-button" onClick={() => dismiss('essential')}>{settings.rejectLabel}</button><button className="text-button" onClick={() => setPreferences(!preferences)}>{settings.manageLabel}</button></div></aside>
}

function ContentUnavailable({ mode, content, message }: { mode: SiteMode; content: CmsContent; message: string }) {
  return <div className="igas-site"><Header mode={mode} navigation={content.navigation} /><main className="inner-page container"><EmptyState label={message} unavailable={content.unavailable} /></main><Footer mode={mode} footer={content.footer} /><CookieBanner settings={content.settings.cookieConsent} /></div>
}

export function HomePage({ mode, content }: { mode: SiteMode; content: CmsContent }) {
  const services = content.services.length ? content.services : [
    { title: 'Audit & assurance', slug: 'audit-assurance', tag: '01', description: 'Build trust in the information, controls and decisions your stakeholders rely on.' },
    { title: 'Tax', slug: 'tax', tag: '02', description: 'Turn tax complexity into clarity, confidence and better capital allocation.' },
    { title: 'Consulting', slug: 'consulting', tag: '03', description: 'Turn ambiguity into an executable path forward, grounded in evidence.' },
    { title: 'Deals', slug: 'deals', tag: '04', description: 'Make high stakes investment and portfolio decisions with sharper perspective.' },
  ]
  const industries = content.industries.length ? content.industries : [
    { title: 'Manufacturing', slug: 'manufacturing', description: 'Productivity, resilience and scale.' },
    { title: 'Financial services', slug: 'financial-services', description: 'Trust and relevance in a changing market.' },
    { title: 'Technology', slug: 'information-technology', description: 'Clarity through velocity and change.' },
  ]
  return <div className="igas-site">
    <Header mode={mode} navigation={content.navigation} />
    <OrganizationSchema />
    <main>
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-content">
          <p className="eyebrow">Independent advice for consequential decisions</p>
          <h1>Clarity for the moments that change what comes next.</h1>
          <p className="hero-intro">IGAS helps leaders, institutions and investors navigate complexity with advice built to move decisions forward.</p>
          <Link className="button button-light" href="/contact">Start a conversation <ArrowUpRight size={16} /></Link>
        </div>
      </section>
      <section className="container page-intro">
        <p className="eyebrow">What we do</p>
        <h2>Experience for decisions that matter.</h2>
        <p className="lead">We bring clear thinking and practical expertise to complex business questions.</p>
      </section>
      <section className="container listing-grid" aria-label="Services">
        {services.slice(0, 4).map((service) => <Link className="listing-card dark-card" href={`/services/${service.slug}`} key={service.slug}><span>{service.tag || 'IGAS'}</span><h2>{service.title}</h2><p>{service.shortDescription || service.description}</p><ArrowUpRight /></Link>)}
      </section>
      <section className="container page-intro">
        <p className="eyebrow">Where we focus</p>
        <h2>Deep context. Wider perspective.</h2>
      </section>
      <section className="container industry-list" aria-label="Industries">
        {industries.slice(0, 6).map((industry) => <Link className="industry-row" href={`/industries/${industry.slug}`} key={industry.slug}><span><strong>{industry.title}</strong><small>{industry.description}</small></span><ArrowUpRight size={18} /></Link>)}
      </section>
      <section className="leadership-presence dark-section"><div className="container presence-feature"><div className="presence-lead"><p className="eyebrow">IGAS Global</p><h2>Local insight.<br /><em>Global perspective.</em></h2><p className="lead">Senior guidance and local conviction, connected across the markets where our clients operate.</p><Link className="button button-light" href="/about">Discover IGAS <ArrowUpRight size={16} /></Link></div></div></section>
    </main>
    <Footer mode={mode} footer={content.footer} />
    <CookieBanner settings={content.settings.cookieConsent} />
  </div>
}

type ListingType = 'services' | 'industries' | 'insights' | 'careers' | 'offices'
export function ListingPage({ type, content }: { type: ListingType; content: CmsContent }) {
  const mode = content.mode
  const labels: Record<ListingType, string> = { services: 'Services', industries: 'Industries', insights: 'Articles', careers: 'Careers', offices: 'Offices' }
  const records = type === 'services' ? content.services : type === 'industries' ? content.industries : type === 'insights' ? content.articles : type === 'careers' ? content.jobs.filter((job) => job.applicationStatus === 'open') : content.offices
  return <div className="igas-site"><Header mode={mode} navigation={content.navigation} /><main className="inner-page"><div className="container page-intro"><p className="eyebrow">{labels[type]}</p><h1>{labels[type]}</h1></div>{!records.length ? <div className="container"><EmptyState label={content.unavailable ? `The ${labels[type].toLowerCase()} collection could not be loaded.` : `There are no published ${labels[type].toLowerCase()} to display.`} unavailable={content.unavailable} /></div> : type === 'services' ? <div className="container listing-grid">{content.services.map((item) => <Link className="listing-card dark-card" href={`/services/${item.slug}`} key={item.slug}><span>{item.tag}</span><h2>{item.title}</h2><p>{item.description}</p><ArrowUpRight /></Link>)}</div> : type === 'industries' ? <div className="container listing-grid">{content.industries.map((item) => <Link className="listing-card" href={`/industries/${item.slug}`} key={item.slug}><span>{labels[type]}</span><h2>{item.title}</h2><p>{item.description}</p><ArrowUpRight /></Link>)}</div> : type === 'insights' ? <div className="container article-grid inner-articles">{content.articles.map((item) => <Link className="article-card" href={`/articles/${item.slug}`} key={item.slug}>{item.media.src && <div className="article-image" style={{ backgroundImage: `url('${item.media.src}')` }} /> }<div className="article-meta"><span>{item.category}</span><span>{item.date}</span></div><h3>{item.title}</h3><p>{item.excerpt}</p></Link>)}</div> : type === 'offices' ? <div className="container offices-grid">{content.offices.map((office) => <Link className="office-tile" href={`/offices/${office.slug}`} key={office.slug}><p className="eyebrow">{office.country}</p><h2>{office.name}</h2><p>{office.address || office.detail}</p><ArrowUpRight /></Link>)}</div> : <div className="container jobs-list">{content.jobs.filter((job) => job.applicationStatus === 'open').map((job) => <Link className="job-row" href={`/careers/${job.slug}`} key={job.slug}><div><span>{job.employmentType}</span><h2>{job.title}</h2></div><p>{job.location}</p><ArrowUpRight /></Link>)}</div>}</main><Footer mode={mode} footer={content.footer} /><CookieBanner settings={content.settings.cookieConsent} /></div>
}

function ArticleBody({ content }: { content: ArticleContentBlock[] }) { return <div className="article-rich-content">{content.map((block, index) => { const text = (block.children || []).map((child) => child.text || '').join(''); if (!text) return null; if (block.type === 'heading') { const Heading = block.level === 2 ? 'h2' : 'h3'; return <Heading key={index}>{text}</Heading> } if (block.type === 'list') return <ul key={index}><li>{text}</li></ul>; return <p key={index}>{text}</p> })}</div> }
export function DetailPage({ title, description, eyebrow, content, path = '/', mode = 'india' }: { title: string; description: string; eyebrow?: string; content?: ArticleContentBlock[]; path?: string; mode?: SiteMode }) {
  const hasBody = Boolean(content?.length)
  return <div className="igas-site"><Header mode={mode} /><BreadcrumbSchema items={[{ name: 'Home', path: mode === 'global' ? '/global' : '/' }, { name: title, path }]} /><main className={cx('detail-page', hasBody && 'article-detail')}><div className="container detail-hero"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href={mode === 'global' ? '/global' : '/'}>Home</Link><span aria-hidden="true">/</span><span>{title}</span></nav>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="lead">{description}</p>}</div><div className="container detail-body">{hasBody ? <ArticleBody content={content!} /> : <EmptyState label="More content has not been published yet." />}</div></main><Footer mode={mode} /></div>
}

export function NotFoundPage() { return <div className="igas-site"><Header mode="india" /><main className="not-found-page"><div className="container"><p className="eyebrow">404</p><h1>Page not found</h1><Link className="button button-dark" href="/">Return home <ArrowUpRight size={16} /></Link></div></main><Footer mode="india" /></div> }

export function ContentUnavailablePage({ mode, content }: { mode: SiteMode; content: CmsContent }) { return <ContentUnavailable mode={mode} content={content} message="This page has no published Strapi content." /> }
