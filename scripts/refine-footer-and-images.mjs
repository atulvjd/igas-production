import fs from 'node:fs/promises'

// Local CMS changes only. Images reuse the website's existing editorial sources.
// Run: node --env-file=.env.local --env-file=.env.cms-edit.local scripts/refine-footer-and-images.mjs
const base = process.env.CMS_EDIT_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local CMS only.')
if (!process.env.CMS_EDIT_API_TOKEN) throw new Error('CMS_EDIT_API_TOKEN is required.')
const headers = { Authorization: `Bearer ${process.env.CMS_EDIT_API_TOKEN}`, 'Content-Type': 'application/json' }
async function api(endpoint, method = 'GET', data) {
  const response = await fetch(`${base}/api/${endpoint}`, { method, headers, body: data ? JSON.stringify({ data }) : undefined, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${method} ${endpoint}: HTTP ${response.status} ${(await response.json()).error?.message || ''}`)
  return (await response.json()).data
}
const snapshot = {}
for (const name of ['services', 'offices', 'footers', 'articles', 'industries']) {
  snapshot[name] = {}
  for (const status of ['draft', 'published']) snapshot[name][status] = await api(`${name}?status=${status}&populate=*&pagination[pageSize]=100`)
}
const backup = `cms/.tmp/footer-images-${Date.now()}`
await fs.mkdir(backup, { recursive: true, mode: 0o700 })
await fs.writeFile(`${backup}/before.json`, JSON.stringify(snapshot, null, 2), { mode: 0o600 })
const changes = []
async function save(collection, record, data) {
  await api(`${collection}/${record.documentId}?status=published`, 'PUT', data)
  const verified = await api(`${collection}/${record.documentId}?status=published&populate=*`)
  for (const [key, value] of Object.entries(data)) if (typeof value === 'string' && verified[key] !== value) throw new Error(`Verification failed: ${collection}.${key}`)
  changes.push({ collection, documentId: record.documentId, fields: Object.keys(data) })
  await fs.writeFile(`${backup}/changes.json`, JSON.stringify(changes, null, 2), { mode: 0o600 })
  console.log(`Published and verified: ${collection} / ${record.title || record.name || record.mode}`)
}
const articleImage = slug => snapshot.articles.published.find(item => item.slug === slug)?.imageUrl
const industryImage = slug => snapshot.industries.published.find(item => item.slug === slug)?.imageUrl
const teamwork = articleImage('technology-catalyst-for-change')
const analysis = articleImage('rethinking-risk-connected-world')
const discussion = articleImage('building-resilient-organizations')
const planning = articleImage('future-of-business-transformation')
const finance = industryImage('financial-services')
const images = {
  'tax-regulatory': [finance, 'Illustrative financial documents and calculation tools for tax and regulatory work'],
  'risk-compliance': [analysis, 'Illustrative financial analysis for risk and compliance'],
  'business-transformation': [teamwork, 'Illustrative collaboration on business systems and change'],
  'advisory-consulting': [discussion, 'Illustrative presentation of financial information for business advice'],
  'audit-assurance': [finance, 'Illustrative financial records for audit and assurance'],
  deals: [teamwork, 'Illustrative collaborative review of a business opportunity'],
  forensic: [analysis, 'Illustrative analysis of financial information for forensic work'],
  strategy: [planning || teamwork, 'Illustrative business planning and strategy discussion'],
}
for (const record of snapshot.services.published) {
  const [imageUrl, imageAlt] = images[record.slug] || []
  if (!imageUrl || record.heroImage?.file || record.imageUrl) continue
  await save('services', record, { imageUrl, imageAlt })
}
for (const record of snapshot.offices.published) {
  if (record.image?.file || record.imageUrl || !teamwork) continue
  await save('offices', record, { imageUrl: teamwork, imageAlt: `Illustrative business collaboration for the ${record.city} office page; not a photograph of IGAS premises` })
}
for (const record of snapshot.footers.published) {
  await save('footers', record, {
    signature: 'Indian roots. Practical advice. Pride in service.',
    newsletterTitle: 'A fresh perspective',
    newsletterDescription: 'Ideas on business, finance and the decisions ahead.',
    usefulLinks: [
      ['About IGAS', '/about'], ['Services', '/services'], ['Industries', '/industries'], ['Latest thinking', '/latest-thinking'], ['Contact', '/contact'],
    ].map(([label, href], order) => ({ label, href, external: false, order })),
  })
}
if (process.env.REVALIDATION_SECRET) {
  const response = await fetch('http://localhost:3000/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` }, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`Cache refresh returned HTTP ${response.status}`)
}
console.log(`Saved ${changes.length} changes. Before snapshot: ${backup}/before.json`)
