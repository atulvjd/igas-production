import { Globe2 } from 'lucide-react'

/** Small vector brand marks; destinations remain editable in the CMS. */
export function SocialIcon({ href, label }: { href: string; label: string }) {
  let host = ''
  try { host = new URL(href).hostname.replace(/^www\./, '') } catch { /* Label supports future CMS entries. */ }
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM8 19H5V9h3ZM6.5 7.7a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5ZM19 19h-3v-5.4c0-1.3-.5-2.1-1.6-2.1-1.2 0-1.9.9-1.9 2.1V19h-3V9h2.9v1.4h.1a3.3 3.3 0 0 1 2.9-1.6c2.2 0 3.6 1.4 3.6 4.2Z" /></svg>
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
  if (['x.com', 'twitter.com'].includes(host)) return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.5 5.4 22H2.2l8.3-9.5L.8 2h6.4l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.3 4H4.5L17.8 20Z" /></svg>
  return <Globe2 aria-hidden="true"><title>{label}</title></Globe2>
}
