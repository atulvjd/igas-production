export function validateNewsletterEmail(value: unknown) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' }
  return { email }
}

export async function subscribeToNewsletter(email: string, mode: 'india' | 'global' = 'india') {
  const secret = process.env.STRAPI_SUBMISSIONS_SECRET?.trim()
  if (secret) {
    const origin = process.env.STRAPI_URL?.trim().replace(/\/$/, '')
    if (!origin || secret.length < 32) throw new Error('Newsletter storage is not configured.')
    const { fetchWithTimeout } = await import('@/lib/operational')
    const response = await fetchWithTimeout(`${origin}/api/newsletter-subscriptions`, {
      method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { email, consent: true, mode } }), cache: 'no-store',
    }, 20_000)
    if (!response.ok) throw new Error(`Newsletter storage failed (${response.status}).`)
    return { subscribed: true }
  }
  const webhook = process.env.NEWSLETTER_WEBHOOK_URL?.trim()
  if (webhook) {
    const { fetchWithTimeout } = await import('@/lib/operational')
    const response = await fetchWithTimeout(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
    if (!response.ok) throw new Error(`Newsletter delivery failed: ${response.status}`)
    return { subscribed: true }
  }

  if (process.env.NEWSLETTER_DELIVERY_MODE === 'development' && process.env.NODE_ENV !== 'production') {
    return { subscribed: false, development: true }
  }

  throw new Error('Newsletter delivery is not configured.')
}
