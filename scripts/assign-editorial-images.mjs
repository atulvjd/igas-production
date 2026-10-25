import fs from 'node:fs/promises'
import crypto from 'node:crypto'

// Local CMS only. Snapshot both versions, then publish image-only changes.
// node --env-file=.env.local --env-file=.env.cms-edit.local scripts/assign-editorial-images.mjs
const base = process.env.CMS_EDIT_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local CMS required.')
if (!process.env.CMS_EDIT_API_TOKEN) throw new Error('CMS_EDIT_API_TOKEN required.')
const allImages = JSON.parse(await fs.readFile(new URL('./content/editorial-images.json', import.meta.url), 'utf8'))
const plan = process.argv.includes('--pages-only') ? allImages.filter(item => item.collection === 'pages') : allImages
const identities = new Set()
const previewHashes = new Set()
const pending = [...plan]
await Promise.all(Array.from({ length: 6 }, async () => {
  while (pending.length) {
    const item = pending.shift()
    const identity = new URL(item.url).origin + new URL(item.url).pathname
    if (identities.has(identity)) throw new Error(`Repeated source photograph: ${identity}`)
    identities.add(identity)
    const preview = new URL(item.url); preview.searchParams.set('w', '100'); preview.searchParams.set('q', '45')
    const response = await fetch(preview, { signal: AbortSignal.timeout(30000) })
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Image unavailable: ${item.key} (${response.status})`)
    const hash = crypto.createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex')
    if (previewHashes.has(hash)) throw new Error(`Repeated image bytes: ${item.key}`)
    previewHashes.add(hash)
  }
}))
console.log(`Verified ${plan.length} available, distinct photograph sources.`)
const headers = { Authorization: `Bearer ${process.env.CMS_EDIT_API_TOKEN}`, 'Content-Type': 'application/json' }
async function api(path, method = 'GET', data) {
  const response = await fetch(`${base}/api/${path}`, { method, headers, body: data ? JSON.stringify({ data }) : undefined, signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${(await response.json()).error?.message || ''}`)
  return (await response.json()).data
}
const backup = `cms/.tmp/unique-images-${Date.now()}`
await fs.mkdir(backup, { recursive: true, mode: 0o700 })
const before = {}
for (const name of new Set(plan.map(item => item.collection))) {
  before[name] = {}
  for (const status of ['draft', 'published']) before[name][status] = await api(`${name}?status=${status}&${name === 'pages' ? 'populate[sections][populate]=*' : 'populate=*'}&pagination[pageSize]=100`)
}
await fs.writeFile(`${backup}/before.json`, JSON.stringify(before, null, 2), { mode: 0o600 })
const clean = (value, key) => {
  if (key === 'file' && value && typeof value === 'object') return value.id
  if (Array.isArray(value)) return value.map(item => clean(item))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([k, v]) => !['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'locale'].includes(k) && !(v === null && ['image', 'file'].includes(k))).map(([k, v]) => [k, clean(v, k)]))
  return value
}
const groups = new Map()
for (const item of plan) {
  const key = `${item.collection}:${item.key}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(item)
}
const changes = []
for (const items of groups.values()) {
  const { collection, key } = items[0]
  const record = before[collection].published.find(r => (collection === 'site-settings' ? r.mode : collection === 'pages' ? r.path : r.slug) === key)
  if (!record) throw new Error(`Missing published record: ${collection}/${key}`)
  const data = collection === 'pages' ? { sections: clean(record.sections).map(({ __component, ...fields }) => ({ __component, ...fields })) } : {}
  for (const item of items) {
    if (collection === 'pages') {
      const parts = item.field.split('.'); let parent = data
      for (const part of parts.slice(0, -1)) parent = parent[part]
      parent.imageUrl = item.url
      if (parent.__component === 'shared.hero') parent.image = { ...(parent.image || {}), alt: item.alt }
      else parent.imageAlt = item.alt
    } else {
      data[item.field] = item.url
      if (collection === 'site-settings' && ['heroImageUrl', 'aboutImageUrl', 'careersImageUrl'].includes(item.field)) {
        const field = item.field.replace('Url', '')
        data[field] = { ...clean(record[field] || {}), alt: item.alt }
      } else data[item.field.replace('Url', 'Alt')] = item.alt
    }
  }
  await api(`${collection}/${record.documentId}?status=published`, 'PUT', data)
  const actual = await api(`${collection}/${record.documentId}?status=published&${collection === 'pages' ? 'populate[sections][populate]=*' : 'populate=*'}`)
  for (const item of items) {
    let value = actual
    for (const part of item.field.split('.')) value = value?.[part]
    if (value !== item.url) throw new Error(`Readback failed: ${collection}/${key}.${item.field}`)
  }
  changes.push({ collection, key, documentId: record.documentId, fields: items.map(item => item.field) })
  await fs.writeFile(`${backup}/changes.json`, JSON.stringify(changes, null, 2), { mode: 0o600 })
  console.log(`Published and verified ${collection}/${key}: ${items.length} unique photographs`)
}
if (process.env.REVALIDATION_SECRET) {
  const response = await fetch('http://localhost:3000/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` }, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`Cache refresh failed: ${response.status}`)
}
console.log(`Recovery snapshot: ${backup}/before.json`)
