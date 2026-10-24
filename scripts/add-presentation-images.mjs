import fs from 'node:fs/promises'

// Fill empty presentation image fields with editorial photography already in the CMS.
// Run: node --env-file=.env.local --env-file=.env.cms-edit.local scripts/add-presentation-images.mjs
const base = process.env.CMS_EDIT_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local CMS only.')
if (!process.env.CMS_EDIT_API_TOKEN) throw new Error('CMS_EDIT_API_TOKEN is required.')
const headers = { Authorization: `Bearer ${process.env.CMS_EDIT_API_TOKEN}`, 'Content-Type': 'application/json' }
async function api(endpoint, method = 'GET', data) {
  const r = await fetch(`${base}/api/${endpoint}`, { method, headers, body: data ? JSON.stringify({ data }) : undefined, signal: AbortSignal.timeout(20000) })
  if (!r.ok) throw new Error(`CMS returned HTTP ${r.status}`)
  return (await r.json()).data
}
const settings = await api('site-settings?status=published&populate=*')
const articles = await api('articles?status=published&pagination[pageSize]=100')
const imageFor = slug => articles.find(item => item.slug === slug)?.imageUrl
const imagery = {
  heroImageUrl: imageFor('technology-catalyst-for-change'),
  aboutImageUrl: imageFor('building-resilient-organizations'),
  careersImageUrl: imageFor('future-of-business-transformation'),
}
const backup = `cms/.tmp/presentation-images-${Date.now()}`
await fs.mkdir(backup, { recursive: true, mode: 0o700 })
await fs.writeFile(`${backup}/before.json`, JSON.stringify(settings, null, 2), { mode: 0o600 })
for (const item of settings) {
  const data = Object.fromEntries(Object.entries(imagery).filter(([key, value]) => value && !item[key] && !item[key.replace('Url', '')]))
  if (!Object.keys(data).length) continue
  await api(`site-settings/${item.documentId}?status=published`, 'PUT', data)
  const verified = await api(`site-settings/${item.documentId}?status=published`)
  for (const [key, value] of Object.entries(data)) if (verified[key] !== value) throw new Error(`Verification failed for ${item.mode}.${key}`)
  console.log(`Published and verified ${Object.keys(data).length} image fields for ${item.mode}.`)
}
if (process.env.REVALIDATION_SECRET) {
  const r = await fetch('http://localhost:3000/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` } })
  if (!r.ok) throw new Error(`Cache refresh returned HTTP ${r.status}`)
}
