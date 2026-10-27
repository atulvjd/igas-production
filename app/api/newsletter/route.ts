import { subscribeToNewsletter, validateNewsletterEmail } from '@/lib/newsletter'
import { logOperationalEvent, requestId } from '@/lib/operational'
import { rateLimit } from '@/lib/rate-limit'
import { readRequestBody, RequestBodyTooLargeError } from '@/lib/request-body'

export const runtime = 'nodejs'
const NEWSLETTER_MAX_REQUEST_SIZE = 16 * 1024

export async function POST(request: Request) {
  const correlationId = requestId(request)
  const throttle = rateLimit(request, 'newsletter', 8, 10 * 60 * 1000)
  if (!throttle.allowed) return Response.json({ error: 'Please wait before subscribing again.' }, { status: 429, headers: { 'Retry-After': String(throttle.retryAfter) } })
  let body: unknown
  try {
    const bytes = await readRequestBody(request, NEWSLETTER_MAX_REQUEST_SIZE)
    body = JSON.parse(new TextDecoder().decode(bytes))
  } catch (error) {
    const tooLarge = error instanceof RequestBodyTooLargeError
    logOperationalEvent('newsletter.rejected', { correlationId, category: tooLarge ? 'request_size' : 'malformed_request' })
    return Response.json(
      { error: tooLarge ? 'The subscription request is too large.' : 'Enter your email address to subscribe.' },
      { status: tooLarge ? 413 : 400 },
    )
  }

  const input = body && typeof body === 'object' ? body as { consent?: unknown; mode?: unknown } : undefined
  if (input?.consent !== true) return Response.json({ error: 'Please agree to receive the newsletter.' }, { status: 400 })

  const email = body && typeof body === 'object' ? (body as { email?: unknown }).email : undefined
  const result = validateNewsletterEmail(email)
  if (result.error) {
    logOperationalEvent('newsletter.rejected', { correlationId, category: 'validation' })
    return Response.json({ error: result.error }, { status: 400 })
  }

  try {
    const delivery = await subscribeToNewsletter(result.email!, input.mode === 'global' ? 'global' : 'india')
    logOperationalEvent('newsletter.subscribed', { correlationId, development: 'development' in delivery && delivery.development === true })
    return Response.json({ ok: true })
  } catch {
    logOperationalEvent('newsletter.failed', { correlationId, category: 'delivery' })
    return Response.json({ error: 'We could not subscribe you right now.' }, { status: 503 })
  }
}
