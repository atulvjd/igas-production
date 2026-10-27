import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

// Local integration test only. Creates synthetic records and removes exactly those records.
const origin = process.env.SUBMISSION_TEST_WEBSITE_URL || 'http://localhost:3000'
const cms = process.env.STRAPI_URL || 'http://localhost:1337'
if (![origin, cms].every(url => ['localhost', '127.0.0.1'].includes(new URL(url).hostname))) throw new Error('This test only runs against local servers.')
const require = createRequire(new URL('../cms/package.json', import.meta.url))
const Database = require('better-sqlite3')
const db = new Database(new URL('../cms/.tmp/data.db', import.meta.url).pathname)
const name = `[Test] Inbox integration ${Date.now()}`
// A fresh loopback client identity keeps repeated local test runs independent.
const clientHeaders = { 'x-forwarded-for': `127.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 254) + 1}` }
const pdf = Buffer.from('%PDF-1.4\n%%EOF\n')
const secret = process.env.STRAPI_SUBMISSIONS_SECRET
assert.ok(secret?.length >= 32)
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` }
const payload = { name, email: 'integration@example.com', message: 'Synthetic inbox integration test.', consent: true }
try {
  for (const path of ['enquiries', 'job-applications']) {
    assert.equal((await fetch(`${cms}/api/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: payload }) })).status, 403)
    assert.ok([404, 405].includes((await fetch(`${cms}/api/${path}`)).status))
  }
  const invalid = await fetch(`${cms}/api/enquiries`, { method: 'POST', headers, body: JSON.stringify({ data: { ...payload, attachment: { name: 'brief.pdf', type: 'application/pdf', size: 3, contentBase64: Buffer.from('bad').toString('base64') } } }) })
  assert.equal(invalid.status, 400)
  const form = () => {
    const data = new FormData()
    for (const [key, value] of Object.entries(payload)) data.set(key, String(value))
    data.set('mode', 'india')
    data.set('attachment', new File([pdf], 'test-document.pdf', { type: 'application/pdf' }))
    return data
  }
  const enquiry = await fetch(`${origin}/api/contact`, { method: 'POST', headers: clientHeaders, body: form() })
  assert.equal(enquiry.status, 200, `Enquiry failed with HTTP ${enquiry.status}`)
  const saved = db.prepare('SELECT * FROM enquiries WHERE name = ?').get(name)
  assert.ok(saved)
  assert.equal(saved.submission_status, 'new')
  assert.equal(JSON.parse(saved.attachment).contentBase64, pdf.toString('base64'))

  const jobsResponse = await fetch(`${cms}/api/jobs?status=published&filters[applicationStatus][$eq]=open`, { headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` } })
  assert.equal(jobsResponse.status, 200)
  const { data: jobs } = await jobsResponse.json()
  const job = jobs.find(item => item.mode !== 'global' && (!item.deadline || Date.parse(`${item.deadline}T23:59:59.999Z`) > Date.now()))
  assert.ok(job, 'A published open India role is required for this integration test.')
  const application = form()
  application.set('jobSlug', job.slug)
  const result = await fetch(`${origin}/api/applications`, { method: 'POST', headers: clientHeaders, body: application })
  assert.equal(result.status, 200, `Application failed with HTTP ${result.status}`)
  const savedApplication = db.prepare('SELECT * FROM job_applications WHERE name = ?').get(name)
  assert.ok(savedApplication)
  assert.equal(savedApplication.job_title, job.title)
  assert.equal(JSON.parse(savedApplication.attachment).contentBase64, pdf.toString('base64'))
  const missingCv = form()
  missingCv.set('jobSlug', job.slug)
  missingCv.delete('attachment')
  assert.equal((await fetch(`${origin}/api/applications`, { method: 'POST', headers: clientHeaders, body: missingCv })).status, 400)
  const closedRole = form()
  closedRole.set('jobSlug', 'nonexistent-integration-test-role')
  assert.equal((await fetch(`${origin}/api/applications`, { method: 'POST', headers: clientHeaders, body: closedRole })).status, 400)
  for (let i = 0; i < 2; i++) assert.equal((await fetch(`${origin}/api/applications`, { method: 'POST', headers: clientHeaders, body: missingCv })).status, 400)
  assert.equal((await fetch(`${origin}/api/applications`, { method: 'POST', headers: clientHeaders, body: missingCv })).status, 429)
  console.log('Passed: both website forms persist records and files; inbox reads and unauthenticated writes are blocked; invalid files, missing CVs and unknown roles are rejected.')
} finally {
  for (const table of ['enquiries', 'job_applications']) db.prepare(`DELETE FROM ${table} WHERE name = ?`).run(name)
  db.close()
}
