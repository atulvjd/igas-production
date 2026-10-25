import fs from 'node:fs/promises'

// Uses existing CMS fields only; run against the local CMS with both env files.
// node --env-file=.env.local --env-file=.env.cms-edit.local scripts/refine-home-and-contact.mjs
const base = process.env.CMS_EDIT_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local CMS only.')
if (!process.env.CMS_EDIT_API_TOKEN) throw new Error('CMS_EDIT_API_TOKEN is required.')
const headers = { Authorization: `Bearer ${process.env.CMS_EDIT_API_TOKEN}`, 'Content-Type': 'application/json' }
async function api(path, method = 'GET', data) {
  const response = await fetch(`${base}/api/${path}`, { method, headers, body: data ? JSON.stringify({ data }) : undefined, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${method} ${path}: HTTP ${response.status}`)
  return (await response.json()).data
}
const before = {}
for (const collection of ['site-settings', 'footers']) {
  before[collection] = {}
  for (const status of ['draft', 'published']) before[collection][status] = await api(`${collection}?status=${status}&populate=*&pagination[pageSize]=100`)
}
const directory = `cms/.tmp/home-contact-${Date.now()}`
await fs.mkdir(directory, { recursive: true, mode: 0o700 })
await fs.writeFile(`${directory}/before.json`, JSON.stringify(before, null, 2), { mode: 0o600 })
const changes = []
async function save(collection, record, data) {
  if (Object.entries(data).every(([key, value]) => record[key] === value)) return
  await api(`${collection}/${record.documentId}?status=published`, 'PUT', data)
  for (const status of ['draft', 'published']) {
    const actual = await api(`${collection}/${record.documentId}?status=${status}`)
    for (const [key, value] of Object.entries(data)) if (actual[key] !== value) throw new Error(`Verification failed: ${collection}.${key} (${status})`)
  }
  changes.push({ collection, documentId: record.documentId, fields: Object.keys(data) })
  await fs.writeFile(`${directory}/changes.json`, JSON.stringify(changes, null, 2), { mode: 0o600 })
  console.log(`Published and verified ${collection}: ${record.mode}`)
}
for (const record of before['site-settings'].published) {
  // Restore absent hero copy without replacing text subsequently edited in the CMS.
  const hero = {
    heroEyebrow: record.mode === 'global' ? 'Homegrown in India. A wider perspective.' : 'IGAS · Pride in service',
    heroTitle: 'Pride in service. Confidence in delivery.',
    heroIntro: 'A homegrown Indian accounting and consulting firm bringing together audit, tax, consulting, deals, forensic and strategy expertise. Practical guidance, active partner involvement and care for the people behind every business.',
    heroCta: 'Explore our services', heroCtaHref: '/services',
    aboutCtaLabel: 'Get to know IGAS', aboutCtaHref: '/about',
  }
  await save('site-settings', record, {
    ...Object.fromEntries(Object.entries(hero).filter(([key]) => !record[key]?.trim())),
    contactEyebrow: 'Let’s start a conversation',
    contactIntro: 'From audit and tax to business change, tell us where you need clarity. Share your priorities with our Mumbai or Bengaluru team so we can discuss a practical way forward.',
    contactConsentText: record.contactConsentText || 'I agree to be contacted by IGAS about this enquiry.',
  })
}
for (const record of before.footers.published) {
  await save('footers', record, {
    signature: 'A homegrown Indian accounting and consulting firm. Audit, tax and practical business advice, guided by care and active partner involvement.',
  })
}
if (process.env.REVALIDATION_SECRET) {
  const response = await fetch('http://localhost:3000/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` }, signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(`Cache refresh: HTTP ${response.status}`)
}
console.log(`Recovery snapshot: ${directory}/before.json`)
