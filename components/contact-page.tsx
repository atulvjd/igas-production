'use client'

import { useRef, useState } from 'react'
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react'
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
  return <form className="contact-form" onSubmit={submit} aria-busy={busy}><label>Name<input required autoComplete="name" maxLength={120} name="name" /></label><label>Work email<input required autoComplete="email" maxLength={254} type="email" name="email" /></label><label>How can we help?<textarea required maxLength={5000} name="message" rows={5} /></label><label className="file-label">Attach a brief (optional)<input type="file" name="attachment" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label><p className="attachment-hint">PDF, DOC or DOCX · Up to 5 MB</p><label className="consent"><input required type="checkbox" name="consent" value="true" /> {consentText || 'I agree to be contacted by IGAS about this enquiry.'}</label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send enquiry'} {busy ? <LoaderCircle className="interaction-spinner" size={16} aria-hidden="true" /> : <ArrowUpRight size={16} />}</button></form>
}

export function ContactPage({ content }: { content?: CmsContent }) {
  const mode = content?.mode || 'india'
  const settings = content?.settings
  const image = settings?.aboutImage?.src || settings?.aboutImageUrl
  const hasContactCopy = Boolean(settings?.contactTitle || settings?.contactIntro || settings?.contactEmail || settings?.contactPhone)
  return <div className="igas-site"><Header mode={mode} navigation={content?.navigation} /><main id="main-content" tabIndex={-1} className="contact-page"><div className="container contact-layout"><div>{hasContactCopy ? <><p className="eyebrow">{settings?.contactEyebrow}</p>{settings?.contactTitle && <h1>{settings.contactTitle}</h1>}{settings?.contactIntro && <p className="lead">{settings.contactIntro}</p>}<div className="contact-details">{settings?.contactEmail && <><span>{settings.contactEyebrow}</span><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></>}{settings?.contactPhone && <><span>{mode === 'global' ? 'Global' : 'India'}</span><a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a></>}</div>{image && <div className="contact-visual"><img src={image} alt={settings?.aboutImage?.alt || 'Business collaboration'} loading="lazy" /></div>}</> : <p className="empty-state">Contact information will appear here when published.</p>}</div><ContactForm consentText={settings?.contactConsentText} successMessage={content?.settings.contactSuccessMessage} /></div></main><Footer mode={mode} footer={content?.footer} /></div>
}
