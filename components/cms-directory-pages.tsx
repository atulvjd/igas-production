'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Footer, Header } from '@/components/igas-site'
import { RichText } from '@/components/rich-text'
import type { SiteMode } from '@/lib/igas-data'
import type { CmsJob, CmsLeadership, CmsOffice } from '@/lib/cms-content'


export function LeadershipListingPage({ profiles, mode }: { profiles: CmsLeadership[]; mode: SiteMode }) {
  return <div className="igas-site"><Header mode={mode} /><main id="main-content" tabIndex={-1} className="inner-page"><div className="container page-intro"><p className="eyebrow">Who we are</p><h1>Leadership</h1></div><div className="container listing-grid">{profiles.length ? profiles.map((profile) => <Link className="listing-card" href={`/leadership/${profile.slug}`} key={profile.slug}>{profile.media && <div className="article-image" style={{ backgroundImage: `url('${profile.media.src}')` }} /> }<span>{profile.position}</span><h2>{profile.name}</h2><ArrowUpRight /></Link>) : <div className="empty-state-panel"><p className="eyebrow">Nothing here yet</p><p>Leadership profiles will appear here when published.</p></div>}</div></main><Footer mode={mode} /></div>
}

export function LeadershipDetailPage({ profile, mode }: { profile: CmsLeadership; mode: SiteMode }) {
  return <div className="igas-site"><Header mode={mode} /><main id="main-content" tabIndex={-1} className="detail-page"><div className="container detail-hero">{profile.media && <div className="article-image" style={{ maxWidth: 560, marginBottom: 32, backgroundImage: `url('${profile.media.src}')` }} /> }<p className="eyebrow">{profile.position}</p><h1>{profile.name}</h1><p className="lead">{profile.position}</p></div><div className="container detail-body"><div><RichText content={profile.biography} />{profile.email && <a className="arrow-link" href={`mailto:${profile.email}`}>Contact {profile.name} <ArrowUpRight size={17} /></a>}{profile.linkedInUrl && <a className="arrow-link" href={profile.linkedInUrl} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={17} /></a>}{profile.relatedServices.map((service) => <Link className="arrow-link" href={`/services/${service.slug}`} key={service.slug}>{service.title}<ArrowUpRight size={17} /></Link>)}{profile.relatedIndustries.map((industry) => <Link className="arrow-link" href={`/industries/${industry.slug}`} key={industry.slug}>{industry.title}<ArrowUpRight size={17} /></Link>)}</div></div></main><Footer mode={mode} /></div>
}

export function OfficeDetailPage({ office, mode }: { office: CmsOffice; mode: SiteMode }) {
  const mapHref = office.latitude !== undefined && office.longitude !== undefined ? `https://www.google.com/maps/search/?api=1&query=${office.latitude},${office.longitude}` : undefined
  return <div className="igas-site"><Header mode={mode} /><main id="main-content" tabIndex={-1} className="detail-page"><div className="container detail-hero">{office.media && <div className="article-image" style={{ maxWidth: 700, marginBottom: 32, backgroundImage: `url('${office.media.src}')` }} /> }<p className="eyebrow">{office.country}</p><h1>{office.name}</h1><p className="lead">{office.address || office.detail}</p></div><div className="container detail-body"><div><RichText content={office.description} />{office.email && <a className="arrow-link" href={`mailto:${office.email}`}>Email the office <ArrowUpRight size={17} /></a>}{office.phone && <a className="arrow-link" href={`tel:${office.phone}`}>Call the office <ArrowUpRight size={17} /></a>}{mapHref && <a className="arrow-link" href={mapHref} target="_blank" rel="noreferrer">Open map <ArrowUpRight size={17} /></a>}{office.services.map((service) => <Link className="arrow-link" href={`/services/${service.slug}`} key={service.slug}>{service.title}<ArrowUpRight size={17} /></Link>)}</div></div></main><Footer mode={mode} /></div>
}

export function JobDetailPage({ job, mode }: { job: CmsJob; mode: SiteMode }) {
  const sections = [
    ['Role overview', job.description],
    ['Responsibilities', job.responsibilities],
    ['Requirements', job.requirements || job.qualifications],
    ['Benefits', job.benefits],
  ] as const
  const applicationHref = job.applicationUrl || (job.applicationCTA?.startsWith('/') || job.applicationCTA?.startsWith('https://') ? job.applicationCTA : '/contact')
  const applicationLabel = job.applicationCTA && !job.applicationCTA.startsWith('/') && !job.applicationCTA.startsWith('https://') ? job.applicationCTA : 'Apply for this role'
  return <div className="igas-site"><Header mode={mode} /><main id="main-content" tabIndex={-1} className="detail-page"><div className="container detail-hero"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/careers">Careers</Link><span aria-hidden="true">/</span><span>{job.title}</span></nav><p className="eyebrow">{[job.department, job.employmentType, job.location].filter(Boolean).join(' · ')}</p><h1>{job.title}</h1>{job.shortDescription && <p className="lead">{job.shortDescription}</p>}{job.officeSlug && <Link className="arrow-link" href={`/offices/${job.officeSlug}`}>View office details <ArrowUpRight size={17} /></Link>}{job.deadline && <p className="job-deadline">Applications close: {job.deadline}</p>}<a className="button button-dark" href={applicationHref}>{applicationLabel}<ArrowUpRight size={16} /></a></div>{sections.some(([, content]) => content?.length) && <div className="container detail-body"><div>{sections.map(([title, content]) => content?.length ? <section key={title}><h2>{title}</h2><RichText content={content} /></section> : null)}</div></div>}</main><Footer mode={mode} /></div>
}
