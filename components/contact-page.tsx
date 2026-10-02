'use client'

import { useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { Footer, Header } from '@/components/igas-site'
import type { CmsContent } from '@/lib/cms-content'

export function ContactForm({ consentText = '', successMessage = '' }: { consentText?: string; successMessage?: string }) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/contact', { method: 'POST', body: new FormData(event.currentTarget) })
      const body = await response.json() as { error?: string }
      if (!response.ok) setError(body.error || 'We could not send your enquiry right now.')
      else setSent(true)
    } catch {
      setError('We could not send your enquiry right now. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  if (sent) return <div className="form-success"><Check size={26} />{successMessage && <p>{successMessage}</p>}</div>
  return <form className="contact-form" onSubmit={submit}><label>Name<input required name="name" /></label><label>Work email<input required type="email" name="email" /></label><label>How can we help?<textarea required name="message" rows={5} /></label><label className="file-label">Attach a brief (optional)<input type="file" name="attachment" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label><label className="consent"><input required type="checkbox" name="consent" value="true" /> {consentText}</label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send'} <ArrowUpRight size={16} /></button></form>
}

export function ContactPage({ content }: { content?: CmsContent }) {
  const mode = content?.mode || 'india'
  const settings = content?.settings
  return <div className="igas-site"><Header mode={mode} navigation={content?.navigation} /><main className="contact-page"><div className="container contact-layout"><div>{settings?.contactEyebrow && <p className="eyebrow">{settings.contactEyebrow}</p>}{settings?.contactTitle && <h1>{settings.contactTitle}</h1>}{settings?.contactIntro && <p className="lead">{settings.contactIntro}</p>}<div className="contact-details">{settings?.contactEmail && <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>}{settings?.contactPhone && <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>}</div></div><div>{settings?.contactConsent ? <ContactForm consentText={settings.contactConsent} successMessage={settings.contactSuccess} /> : <p className="empty-state">This form is not configured for submissions.</p>}{settings?.contactPrivacyNote && <p className="form-note">{settings.contactPrivacyNote}</p>}</div></div></main><Footer mode={mode} footer={content?.footer} /></div>
}
