'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Footer, Header } from '@/components/igas-site'
import type { ArticleContentBlock, SiteMode } from '@/lib/igas-data'
import type { CmsLeadership, CmsOffice } from '@/lib/cms-content'

function Blocks({ content }: { content?: ArticleContentBlock[] }) {
  if (!content?.length) return null
  return <div className="article-rich-content">{content.map((block, index) => { const value = (block.children || []).map((child) => child.text || '').join(''); if (!value) return null; if (block.type === 'heading') { const Heading = block.level === 2 ? 'h2' : 'h3'; return <Heading key={index}>{value}</Heading> } if (block.type === 'list') return <ul key={index}><li>{value}</li></ul>; return <p key={index}>{value}</p> })}</div>
}

export function LeadershipListingPage({ profiles, mode }: { profiles: CmsLeadership[]; mode: SiteMode }) {
  return <div className="igas-site"><Header mode={mode} /><main className="inner-page"><div className="container page-intro"><p className="eyebrow">Who we are</p><h1>The people behind the perspective.</h1><p className="lead">Meet the senior team bringing judgment, sector depth and international experience to the decisions that matter.</p></div><div className="container listing-grid">{profiles.map((profile) => <Link className="listing-card" href={`/leadership/${profile.slug}`} key={profile.slug}>{profile.media && <div className="article-image" style={{ backgroundImage: `url('${profile.media.src}')` }} /> }<span>{profile.position}</span><h2>{profile.name}</h2><ArrowUpRight /></Link>)}</div></main><Footer mode={mode} /></div>
}

export function LeadershipDetailPage({ profile, mode }: { profile: CmsLeadership; mode: SiteMode }) {
  return <div className="igas-site"><Header mode={mode} /><main className="detail-page"><div className="container detail-hero">{profile.media && <div className="article-image" style={{ maxWidth: 560, marginBottom: 32, backgroundImage: `url('${profile.media.src}')` }} /> }<p className="eyebrow">{profile.position}</p><h1>{profile.name}</h1><p className="lead">{profile.position}</p></div><div className="container detail-body"><div><Blocks content={profile.biography} />{profile.email && <a className="arrow-link" href={`mailto:${profile.email}`}>Contact {profile.name} <ArrowUpRight size={17} /></a>}{profile.linkedInUrl && <a className="arrow-link" href={profile.linkedInUrl}>LinkedIn <ArrowUpRight size={17} /></a>}</div></div></main><Footer mode={mode} /></div>
}

export function OfficeDetailPage({ office, mode }: { office: CmsOffice; mode: SiteMode }) {
  return <div className="igas-site"><Header mode={mode} /><main className="detail-page"><div className="container detail-hero">{office.media && <div className="article-image" style={{ maxWidth: 700, marginBottom: 32, backgroundImage: `url('${office.media.src}')` }} /> }<p className="eyebrow">{office.country}</p><h1>{office.name}</h1><p className="lead">{office.address || office.detail}</p></div><div className="container detail-body"><div><Blocks content={office.description} />{office.email && <a className="arrow-link" href={`mailto:${office.email}`}>Email the office <ArrowUpRight size={17} /></a>}{office.phone && <a className="arrow-link" href={`tel:${office.phone}`}>Call the office <ArrowUpRight size={17} /></a>}</div></div></main><Footer mode={mode} /></div>
}
