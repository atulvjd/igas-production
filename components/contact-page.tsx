'use client'

import { useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { Footer, Header } from '@/components/igas-site'
import type { CmsContent } from '@/lib/cms-content'

export function ContactForm({ consentText = 'I agree to be contacted by IGAS about this enquiry.' }: { consentText?: string }) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const response = await fetch('/api/contact', { method: 'POST', body: new FormData(event.currentTarget) })
    const body = await response.json() as { error?: string }
    if (!response.ok) setError(body.error || 'We could not send your enquiry right now.')
    else setSent(true)
    setBusy(false)
  }
  if (sent) return <div className="form-success"><Check size={26} /><h2>Thank you for reaching out.</h2><p>We’ll be in touch shortly.</p></div>
  return <form className="contact-form" onSubmit={submit}><label>Name<input required name="name" /></label><label>Work email<input required type="email" name="email" /></label><label>How can we help?<textarea required name="message" rows={5} /></label><label className="file-label">Attach a brief (optional)<input type="file" name="attachment" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label><label className="consent"><input required type="checkbox" name="consent" value="true" /> {consentText}</label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send enquiry'} <ArrowUpRight size={16} /></button><p className="form-note">Your enquiry is handled confidentially by the IGAS team.</p></form>
}

export function ContactPage({ content }: { content?: CmsContent }) {
  const mode = content?.mode || 'india'
  const settings = content?.settings
  return <div className="igas-site"><Header mode={mode} navigation={content?.navigation} /><main className="contact-page"><div className="container contact-layout"><div><p className="eyebrow">Get in touch</p><h1>Let’s talk about what’s next.</h1><p className="lead">Tell us a little about the decision in front of you. The right person from our team will be in touch.</p><div className="contact-details"><span>General enquiries</span><a href={`mailto:${settings?.contactEmail || 'connect@igasglobal.com'}`}>{settings?.contactEmail || 'connect@igasglobal.com'}</a><span>{mode === 'global' ? 'Global' : 'India'}</span><a href={`tel:${settings?.contactPhone || '+912240000000'}`}>{settings?.contactPhone || '+91 22 4000 0000'}</a></div></div><ContactForm /></div></main><Footer mode={mode} footer={content?.footer} /></div>
}
