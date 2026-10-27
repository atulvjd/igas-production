import type { ValidatedContactSubmission } from '@/lib/contact'
import { CONTACT_MAX_REQUEST_SIZE, deliverContactSubmission, validateContactForm } from '@/lib/contact'
import { logOperationalEvent, requestId } from '@/lib/operational'
import { rateLimit } from '@/lib/rate-limit'
import { readLimitedFormData, RequestBodyTooLargeError } from '@/lib/request-body'
import { getStrapiContent } from '@/lib/strapi'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const correlationId = requestId(request)
  const throttle = rateLimit(request, 'applications', 5, 10 * 60 * 1000)
  if (!throttle.allowed) return Response.json({ error: 'Please wait before sending another application.' }, { status: 429, headers: { 'Retry-After': String(throttle.retryAfter) } })
  let form: FormData
  try {
    form = await readLimitedFormData(request, CONTACT_MAX_REQUEST_SIZE)
  } catch (error) {
    return Response.json({ error: 'The application could not be read. CVs must be 3 MB or smaller.' }, { status: error instanceof RequestBodyTooLargeError ? 413 : 400 })
  }
  const result = validateContactForm(form)
  if (result.error) return Response.json({ error: result.error.replace('work email', 'email address').replace('this enquiry', 'this application') }, { status: 400 })
  if (!result.value?.attachmentFile) return Response.json({ error: 'Please upload your CV (PDF, DOC or DOCX).' }, { status: 400 })
  const mode = form.get('mode')
  const slug = form.get('jobSlug')
  if ((mode !== 'india' && mode !== 'global') || typeof slug !== 'string' || !slug || slug.length > 200) return Response.json({ error: 'Please select a valid role.' }, { status: 400 })
  try {
    const content = await getStrapiContent(mode)
    const job = content.jobs.find(item => item.slug === slug && item.applicationStatus === 'open')
    if (!job || (job.deadline && Date.parse(`${job.deadline.slice(0, 10)}T23:59:59.999Z`) < Date.now())) return Response.json({ error: 'This role is no longer accepting applications.' }, { status: 400 })
    const submission: ValidatedContactSubmission = { ...result.value, value: { ...result.value.value, type: 'job_application', jobSlug: job.slug, jobTitle: job.title, mode } }
    await deliverContactSubmission(submission, 'application')
    logOperationalEvent('application.delivered', { correlationId })
    return Response.json({ ok: true })
  } catch {
    logOperationalEvent('application.failed', { correlationId, category: 'delivery' })
    return Response.json({ error: 'We could not send your application right now. Please try again later.' }, { status: 503 })
  }
}
