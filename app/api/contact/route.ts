import { deliverContactSubmission, validateContactForm } from '@/lib/contact'
import { logOperationalEvent, requestId } from '@/lib/operational'
import { rateLimit } from '@/lib/rate-limit'
import { readLimitedFormData, RequestBodyTooLargeError } from '@/lib/request-body'
import { CONTACT_MAX_REQUEST_SIZE } from '@/lib/contact'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const correlationId = requestId(request)
  const throttle = rateLimit(request, 'contact', 5, 10 * 60 * 1000)
  if (!throttle.allowed) {
    logOperationalEvent('contact.rejected', { correlationId, category: 'rate_limit' })
    return Response.json({ error: 'Please wait before sending another enquiry.' }, { status: 429, headers: { 'Retry-After': String(throttle.retryAfter) } })
  }
  let formData: FormData
  try {
    formData = await readLimitedFormData(request, CONTACT_MAX_REQUEST_SIZE)
  } catch (error) {
    const tooLarge = error instanceof RequestBodyTooLargeError
    logOperationalEvent('contact.rejected', { correlationId, category: tooLarge ? 'request_size' : 'malformed_request' })
    return Response.json(
      { error: tooLarge ? 'The request is too large. Attachments must be 5 MB or smaller.' : 'The enquiry form could not be read. Please check the submitted fields.' },
      { status: tooLarge ? 413 : 400 },
    )
  }

  const result = validateContactForm(formData)
  if (result.error) {
    logOperationalEvent('contact.rejected', { correlationId, category: 'validation' })
    return Response.json({ error: result.error }, { status: 400 })
  }

  try {
    await deliverContactSubmission(result.value!)
    logOperationalEvent('contact.delivered', { correlationId, development: process.env.CONTACT_DELIVERY_MODE === 'development' })
    return Response.json({ ok: true })
  } catch {
    logOperationalEvent('contact.failed', { correlationId, category: 'delivery' })
    return Response.json({ error: 'We could not send your enquiry right now.' }, { status: 503 })
  }
}
