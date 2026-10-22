export const CONTACT_MAX_FILE_SIZE = 5 * 1024 * 1024
export const CONTACT_MAX_REQUEST_SIZE = CONTACT_MAX_FILE_SIZE + 64 * 1024
export const CONTACT_ALLOWED_FILE_TYPES = new Set(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
export const CONTACT_ALLOWED_FILE_EXTENSIONS = new Set(['pdf', 'doc', 'docx'])

export type ContactSubmission = {
  name: string
  email: string
  message: string
  consent: boolean
  attachment?: { name: string; type: string; size: number }
}

type ValidatedContactSubmission = { value: ContactSubmission; attachmentFile?: File }

const cleanText = (value: FormDataEntryValue | null, maxLength: number) => typeof value === 'string' ? value.trim().slice(0, maxLength) : ''

export function validateContactForm(form: FormData): { value?: ValidatedContactSubmission; error?: string } {
  const name = cleanText(form.get('name'), 120)
  const email = cleanText(form.get('email'), 254)
  const message = cleanText(form.get('message'), 5000)
  const consent = form.get('consent') === 'true'
  const attachment = form.get('attachment')

  if (!name || !email || !message) return { error: 'Name, email, and message are required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid work email.' }
  if (!consent) return { error: 'Please confirm that IGAS may contact you about this enquiry.' }

  let attachmentMeta: ContactSubmission['attachment']
  if (attachment instanceof File && attachment.size > 0) {
    if (attachment.size > CONTACT_MAX_FILE_SIZE) return { error: 'Attachments must be 5 MB or smaller.' }
    if (!CONTACT_ALLOWED_FILE_TYPES.has(attachment.type)) return { error: 'Only PDF, DOC, and DOCX attachments are accepted.' }
    const extension = attachment.name.split('.').pop()?.toLowerCase()
    if (!extension || !CONTACT_ALLOWED_FILE_EXTENSIONS.has(extension)) return { error: 'Only PDF, DOC, and DOCX attachments are accepted.' }
    attachmentMeta = { name: attachment.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180), type: attachment.type, size: attachment.size }
  }

  return { value: { value: { name, email, message, consent, attachment: attachmentMeta }, attachmentFile: attachment instanceof File && attachment.size > 0 ? attachment : undefined } }
}

export async function deliverContactSubmission(submission: ValidatedContactSubmission) {
  const webhook = process.env.CONTACT_WEBHOOK_URL?.trim()
  const value = submission.value
  const safelyDeliverAttachment = async (deliver: (bytes: Buffer) => Promise<void>) => {
    if (!submission.attachmentFile || !value.attachment) return deliver(Buffer.alloc(0))
    const { withTemporaryContactAttachment } = await import('@/lib/contact-attachment')
    return withTemporaryContactAttachment(submission.attachmentFile, value.attachment.name, deliver)
  }
  if (webhook) {
    const { fetchWithTimeout } = await import('@/lib/operational')
    // Attachment bytes are sent only when the explicitly approved webhook adapter is enabled.
    if (submission.attachmentFile && process.env.CONTACT_ATTACHMENT_DELIVERY_MODE !== 'webhook-base64') throw new Error('Attachment delivery is not configured.')
    let response: Response | undefined
    await safelyDeliverAttachment(async (bytes) => {
      const attachment = submission.attachmentFile ? { ...value.attachment, contentBase64: bytes.toString('base64') } : undefined
      response = await fetchWithTimeout(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...value, attachment }) })
    })
    if (!response?.ok) throw new Error(`Contact delivery failed: ${response?.status || 'unknown'}`)
    return { delivered: true }
  }

  if (process.env.CONTACT_DELIVERY_MODE === 'development') {
    // Development accepts validated data without persisting or logging private content.
    await safelyDeliverAttachment(async () => undefined)
    return { delivered: false, development: true }
  }

  throw new Error('Contact delivery is not configured.')
}
