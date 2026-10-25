import fs from 'node:fs/promises'

// Public content only; CMS admin accounts and delivery credentials are never changed.
// node --env-file=.env.local --env-file=.env.cms-edit.local scripts/use-placeholder-email.mjs
const replacement = 'example@example.10.com'
const pattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const base = process.env.CMS_EDIT_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local CMS required.')
const headers = { Authorization: `Bearer ${process.env.CMS_EDIT_API_TOKEN}`, 'Content-Type': 'application/json' }
async function api(path, method = 'GET', data) {
  const response = await fetch(`${base}/api/${path}`, { method, headers, body: data ? JSON.stringify({ data }) : undefined, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${(await response.json()).error?.message || ''}`)
  return (await response.json()).data
}
const rewrite = value => typeof value === 'string' ? value.replace(pattern, replacement) : Array.isArray(value) ? value.map(rewrite) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewrite(item)])) : value
const clean = (value, key) => {
  if (key === 'file' && value && typeof value === 'object') return value.id
  if (Array.isArray(value)) return value.map(item => clean(item))
  if (value && typeof value === 'object') {
    const { __component, ...fields } = value
    return { ...(__component ? { __component } : {}), ...Object.fromEntries(Object.entries(fields).filter(([k, v]) => !['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'locale'].includes(k) && !(v === null && ['image', 'file'].includes(k))).map(([k, v]) => [k, clean(v, k)])) }
  }
  return value
}
const before = {}
const fields = { 'site-settings': ['contactEmail'], footers: ['contactEmail'], offices: ['email'], pages: ['sections'] }
const populate = name => name === 'pages' ? 'populate[sections][populate]=*' : 'populate=*'
for (const collection of Object.keys(fields)) {
  before[collection] = {}
  for (const status of ['draft', 'published']) before[collection][status] = await api(`${collection}?status=${status}&${populate(collection)}&pagination[pageSize]=100`)
}
const directory = `cms/.tmp/placeholder-email-${Date.now()}`
await fs.mkdir(directory, { recursive: true, mode: 0o700 })
await fs.writeFile(`${directory}/before.json`, JSON.stringify(before, null, 2), { mode: 0o600 })
for (const [collection, keys] of Object.entries(fields)) {
  for (const record of before[collection].published) {
    const data = {}
    for (const key of keys) {
      const next = rewrite(record[key])
      if (JSON.stringify(next) !== JSON.stringify(record[key])) data[key] = key === 'sections' ? clean(next) : next
    }
    if (!Object.keys(data).length) continue
    await api(`${collection}/${record.documentId}?status=published`, 'PUT', data)
    for (const status of ['draft', 'published']) {
      const actual = await api(`${collection}/${record.documentId}?status=${status}&${populate(collection)}`)
      for (const key of Object.keys(data)) {
        const values = JSON.stringify(actual[key]).match(pattern) || []
        if (values.some(value => value !== replacement)) throw new Error(`Unexpected email remains: ${collection}.${key}`)
        if (!values.length) throw new Error(`Replacement missing: ${collection}.${key}`)
      }
    }
    console.log(`Updated and verified ${collection}/${record.mode || record.slug || record.path}`)
  }
}
if (process.env.REVALIDATION_SECRET) {
  const r = await fetch('http://localhost:3000/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` }, signal: AbortSignal.timeout(20000) })
  if (!r.ok) throw new Error(`Cache refresh: ${r.status}`)
}
console.log(`Before snapshot: ${directory}/before.json`)
