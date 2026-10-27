import type { Core } from '@strapi/strapi';

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const types: Record<string, string> = {
  pdf: 'application/pdf', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export function validateSubmission(input: unknown, application: boolean) {
  if (!input || typeof input !== 'object') throw new Error('Invalid submission.');
  const body = input as Record<string, unknown>;
  const name = text(body.name, 120);
  const email = text(body.email, 254);
  const message = text(body.message, 5000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.consent !== true) throw new Error('Name, valid email, message and consent are required.');
  let attachment;
  if (body.attachment != null) {
    const file = body.attachment as Record<string, unknown>;
    const filename = text(file.name, 180).replace(/[^a-zA-Z0-9._-]/g, '_');
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const encoded = file.contentBase64;
    if (!filename || !types[extension] || file.type !== types[extension] || typeof encoded !== 'string' || !encoded.length || encoded.length > 4 * Math.ceil(MAX_FILE_SIZE / 3) || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) throw new Error('Invalid attachment.');
    const bytes = Buffer.from(encoded, 'base64');
    if (!bytes.length || bytes.length > MAX_FILE_SIZE || file.size !== bytes.length || bytes.toString('base64') !== encoded) throw new Error('Attachments must be 3 MB or smaller.');
    const signature = extension === 'pdf' ? bytes.subarray(0, 5).toString() === '%PDF-'
      : extension === 'doc' ? bytes.subarray(0, 8).equals(Buffer.from('d0cf11e0a1b11ae1', 'hex'))
      : bytes.subarray(0, 4).equals(Buffer.from('504b0304', 'hex'));
    if (!signature) throw new Error('The attachment does not match its document type.');
    attachment = { name: filename, type: types[extension], size: bytes.length, contentBase64: encoded };
  }
  if (application && !attachment) throw new Error('A CV is required.');
  const mode = body.mode === 'global' ? 'global' : 'india';
  const jobSlug = text(body.jobSlug, 200);
  if (application && !jobSlug) throw new Error('A role is required.');
  return { name, email, message, consent: true, attachment, mode, ...(application ? { jobSlug } : {}) };
}

export function createSubmissionController(strapi: Core.Strapi, application: boolean) {
  return async (ctx: any) => {
    let data: Record<string, any>;
    try { data = validateSubmission(ctx.request.body?.data, application); }
    catch (error) { return ctx.badRequest(error instanceof Error ? error.message : 'Invalid submission.'); }
    const uid = application ? 'api::job-application.job-application' : 'api::enquiry.enquiry';
    if (application) {
      const job = await strapi.documents('api::job.job').findFirst({ status: 'published', filters: { slug: data.jobSlug, applicationStatus: 'open', $or: [{ mode: data.mode }, { mode: { $null: true } }] } });
      if (!job || (job.deadline && Date.parse(`${job.deadline}T23:59:59.999Z`) < Date.now())) return ctx.badRequest('This role is not accepting applications.');
      data = { ...data, jobTitle: job.title };
    }
    // Acknowledge only after the complete record and attachment have been saved.
    await strapi.documents(uid as never).create({ data: { ...data, submissionStatus: 'new', receivedAt: new Date().toISOString() } as never });
    ctx.status = 201;
    ctx.body = { ok: true };
  };
}
