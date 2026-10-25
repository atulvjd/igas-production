'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, LoaderCircle, Mail, MapPin } from 'lucide-react'
import { OfficeActions } from '@/components/office-directory'
import { Footer, Header } from '@/components/igas-site'
import type { CmsContent } from '@/lib/cms-content'

export function ContactForm({ consentText = '', successMessage = '' }: { consentText?: string; successMessage?: string }) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setBusy(true)
    setError('')
    const formData = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/contact', { method: 'POST', body: formData })
      const body = await response.json() as { error?: string }
      if (!response.ok) setError(body.error || 'We could not send your enquiry right now.')
      else setSent(true)
    } catch {
      setError('We could not reach the server. Check your connection and try again.')
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }
  if (sent) return <div className="form-success"><Check size={26} /><h2>{successMessage || 'Thank you. Your enquiry was sent.'}</h2></div>
  return <form className="contact-form" onSubmit={submit} aria-busy={busy} aria-labelledby="enquiry-heading">
    <div className="contact-form-heading"><p className="eyebrow">Your next step</p><h2 id="enquiry-heading">Tell us what you have in mind.</h2><p>A little context helps us understand the support you need. All fields are required unless marked optional.</p></div>
    <div className="contact-form-fields"><label>Your name<input required autoComplete="name" maxLength={120} name="name" placeholder="Full name" /></label><label>Work email<input required autoComplete="email" maxLength={254} type="email" name="email" placeholder="example@example.10.com" /></label></div>
    <label>How can we help?<textarea required maxLength={5000} name="message" rows={5} placeholder="Tell us about your organisation, your priorities and the outcome you are working towards." /></label>
    <div className="contact-attachment"><label className="file-label">Attach a brief (optional)<input type="file" name="attachment" aria-describedby="attachment-hint" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label><p className="attachment-hint" id="attachment-hint">PDF, DOC or DOCX · Up to 5 MB</p></div>
    <label className="consent"><input required type="checkbox" name="consent" value="true" /><span>{consentText || 'I agree to be contacted by IGAS about this enquiry.'} <Link href="/privacy-policy">Read our privacy policy.</Link></span></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-dark" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send enquiry'} {busy ? <LoaderCircle className="interaction-spinner" size={16} aria-hidden="true" /> : <ArrowUpRight size={16} />}</button>
  </form>
}

export function ContactPage({ content }: { content?: CmsContent }) {
  const mode = content?.mode || 'india'
  const settings = content?.settings
  const image = settings?.contactImageUrl || settings?.aboutImage?.src || settings?.aboutImageUrl
  const hasContactCopy = Boolean(settings?.contactTitle || settings?.contactIntro || settings?.contactEmail || settings?.contactPhone)
  return <div className="igas-site"><Header mode={mode} navigation={content?.navigation} /><main id="main-content" tabIndex={-1} className="contact-page">
    <div className="container contact-layout"><div className="contact-introduction">{hasContactCopy ? <><p className="eyebrow">{settings?.contactEyebrow}</p>{settings?.contactTitle && <h1>{settings.contactTitle}</h1>}{settings?.contactIntro && <p className="lead">{settings.contactIntro}</p>}
      <div className="contact-direct">{settings?.contactEmail && <a href={`mailto:${settings.contactEmail}`}><Mail size={21} aria-hidden="true" /><span><small>Email our team</small>{settings.contactEmail}</span><ArrowUpRight size={17} aria-hidden="true" /></a>}{settings?.contactPhone && <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>}</div>
      {image && <div className="contact-visual"><img src={image} alt={settings?.contactImageAlt || settings?.aboutImage?.alt || 'Illustrative business collaboration'} loading="lazy" /></div>}</> : <p className="empty-state">Contact information will appear here when published.</p>}</div><ContactForm consentText={settings?.contactConsentText} successMessage={settings?.contactSuccessMessage} /></div>
    {!!content?.offices.length && <section className="container contact-offices" aria-labelledby="contact-offices-heading"><div className="contact-offices-heading"><div><p className="eyebrow">Close to your business</p><h2 id="contact-offices-heading">Find your point of contact.</h2></div><Link className="arrow-link" href="/offices">Explore our offices<ArrowUpRight size={17} /></Link></div><div className="contact-office-grid">{content.offices.map(office => <article className="contact-office-card" key={office.slug}><MapPin size={23} aria-hidden="true" /><div><p className="eyebrow">{office.city}</p><h3>{office.name}</h3>{office.address && <address>{office.address}</address>}<OfficeActions office={office} /><Link href={`/offices/${office.slug}`}>Office details<ArrowUpRight size={15} /></Link></div></article>)}</div></section>}
  </main><Footer mode={mode} footer={content?.footer} /></div>
}
