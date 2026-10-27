import type { ValidatedContactSubmission } from '@/lib/contact'
import { fetchWithTimeout, logOperationalEvent } from '@/lib/operational'

export async function saveStrapiSubmission(submission: ValidatedContactSubmission, application: boolean) {
  const origin = process.env.STRAPI_URL?.trim().replace(/\/$/, '')
  const secret = process.env.STRAPI_SUBMISSIONS_SECRET?.trim()
  if (!origin || !secret || secret.length < 32) {
    logOperationalEvent('submission.storage_failed', { category: !origin ? 'missing_cms_url' : !secret ? 'missing_submission_secret' : 'submission_secret_too_short' })
    throw new Error('Strapi submission storage is not configured.')
  }
  const attachment = submission.attachmentFile && submission.value.attachment ? {
    ...submission.value.attachment,
    contentBase64: Buffer.from(await submission.attachmentFile.arrayBuffer()).toString('base64'),
  } : undefined
  const response = await fetchWithTimeout(`${origin}/api/${application ? 'job-applications' : 'enquiries'}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { ...submission.value, attachment } }),
    cache: 'no-store',
  }, 20_000)
  if (!response.ok) {
    logOperationalEvent('submission.storage_failed', { category: 'cms_response', status: response.status })
    throw new Error(`Strapi submission storage failed (${response.status}).`)
  }
  return { delivered: true }
}
