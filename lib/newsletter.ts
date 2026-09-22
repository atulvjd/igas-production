export function validateNewsletterEmail(value: unknown) {
  const email = typeof value === 'string' ? value.trim().slice(0, 254) : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' }
  return { email }
}

export async function subscribeToNewsletter(email: string) {
  const webhook = process.env.NEWSLETTER_WEBHOOK_URL?.trim()
  if (webhook) {
    const { fetchWithTimeout } = await import('@/lib/operational')
    const response = await fetchWithTimeout(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
    if (!response.ok) throw new Error(`Newsletter delivery failed: ${response.status}`)
    return { subscribed: true }
  }

  if (process.env.NEWSLETTER_DELIVERY_MODE === 'development') {
    return { subscribed: false, development: true }
  }

  throw new Error('Newsletter delivery is not configured.')
}
