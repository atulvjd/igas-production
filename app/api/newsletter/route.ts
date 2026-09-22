import { subscribeToNewsletter, validateNewsletterEmail } from '@/lib/newsletter'
import { logOperationalEvent, requestId } from '@/lib/operational'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const correlationId = requestId(request)
  const throttle = rateLimit(request, 'newsletter', 8, 10 * 60 * 1000)
  if (!throttle.allowed) return Response.json({ error: 'Please wait before subscribing again.' }, { status: 429, headers: { 'Retry-After': String(throttle.retryAfter) } })
  try {
    const body = await request.json() as { email?: unknown }
    const result = validateNewsletterEmail(body.email)
    if (result.error) { logOperationalEvent('newsletter.rejected', { correlationId, category: 'validation' }); return Response.json({ error: result.error }, { status: 400 }) }
    await subscribeToNewsletter(result.email!)
    logOperationalEvent('newsletter.subscribed', { correlationId, development: process.env.NEWSLETTER_DELIVERY_MODE === 'development' })
    return Response.json({ ok: true })
  } catch {
    logOperationalEvent('newsletter.failed', { correlationId, category: 'delivery' })
    return Response.json({ error: 'We could not subscribe you right now.' }, { status: 503 })
  }
}
