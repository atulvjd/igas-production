'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, Copy, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import type { CmsOffice } from '@/lib/cms-content'

export function OfficeActions({ office }: { office: CmsOffice }) {
  const [status, setStatus] = useState('')
  const address = office.address || office.detail
  const hasCoordinates = Number.isFinite(office.latitude) && Number.isFinite(office.longitude)
  const destination = hasCoordinates ? `${office.latitude},${office.longitude}` : [address, office.city, office.country].filter(Boolean).join(', ')
  async function copyAddress() {
    try { await navigator.clipboard.writeText(address); setStatus('Address copied') }
    catch { setStatus('Select the address above to copy it from your browser.') }
  }
  return <div className="office-action-group"><div className="office-actions">
    {destination && <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`} target="_blank" rel="noreferrer"><Navigation size={15} aria-hidden="true" />Get directions<span className="sr-only"> (opens in a new tab)</span></a>}
    {address && <button type="button" onClick={copyAddress}>{status === 'Address copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}Copy address</button>}
    {office.email && <a href={`mailto:${office.email}`}><Mail size={15} aria-hidden="true" />Email office</a>}
    {office.phone && <a href={`tel:${office.phone}`}><Phone size={15} aria-hidden="true" />Call office</a>}
  </div><p className="office-action-status" role="status">{status}</p></div>
}

export function OfficeDirectory({ offices }: { offices: CmsOffice[] }) {
  const [city, setCity] = useState('All offices')
  const cities = [...new Set(offices.map(office => office.city).filter(Boolean))]
  const visible = city === 'All offices' ? offices : offices.filter(office => office.city === city)
  return <section className="container office-directory" aria-label="Find an IGAS office">
    {offices.length > 0 && <div className="office-directory-toolbar"><div className="office-city-filters" role="group" aria-label="Filter offices by city">{['All offices', ...cities].map(label => <button key={label} type="button" aria-pressed={city === label} onClick={() => setCity(label)}>{label}</button>)}</div><p role="status">{visible.length} {visible.length === 1 ? 'office' : 'offices'}</p></div>}
    <div className="office-directory-grid">{visible.map(office => <article className="office-directory-card" key={office.slug}>
      {office.media?.src && <Link className="office-directory-photo" href={`/offices/${office.slug}`} aria-label={`Explore ${office.name || office.city}`}><img src={office.media.src} alt={office.media.alt || 'Illustrative business collaboration'} loading="lazy" /><span><MapPin size={14} aria-hidden="true" />{office.city}</span></Link>}
      <div className="office-directory-copy"><p className="eyebrow">{office.country}</p><h2><Link href={`/offices/${office.slug}`}>{office.city}</Link></h2><p className="office-directory-name">{office.name}</p><address>{office.address || office.detail}</address><OfficeActions office={office} /><Link className="office-details-link" href={`/offices/${office.slug}`}>Explore office<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
    </article>)}</div>
    {!offices.length && <p className="empty-state-panel">Office information will appear here when published.</p>}
  </section>
}
