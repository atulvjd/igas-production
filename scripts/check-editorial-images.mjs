import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

// node --env-file=.env.local scripts/check-editorial-images.mjs
const plan = JSON.parse(await fs.readFile(new URL('./content/editorial-images.json', import.meta.url), 'utf8'))
const base = process.env.STRAPI_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local CMS required.')
const seen = new Map()
for (const item of plan) {
  const url = new URL(item.url); const identity = url.origin + url.pathname
  assert.ok(!seen.has(identity), `Repeated photograph: ${item.key} and ${seen.get(identity)}`)
  seen.set(identity, `${item.collection}/${item.key}/${item.field}`)
}
for (const collection of new Set(plan.map(item => item.collection))) {
  const r = await fetch(`${base}/api/${collection}?status=published&${collection === 'pages' ? 'populate[sections][populate]=*' : 'populate=*'}&pagination[pageSize]=100`, { headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` } })
  assert.equal(r.status, 200)
  const { data } = await r.json()
  for (const item of plan.filter(item => item.collection === collection)) {
    const record = data.find(r => (collection === 'site-settings' ? r.mode : collection === 'pages' ? r.path : r.slug) === item.key)
    assert.ok(record, `Missing ${collection}/${item.key}`)
    let value = record
    for (const field of item.field.split('.')) value = value?.[field]
    assert.equal(value, item.url, `Unexpected photo: ${collection}/${item.key}.${item.field}`)
  }
  console.log(`Verified published image assignments: ${collection}`)
}
console.log(`PASS: ${plan.length} CMS image slots use ${seen.size} distinct photographs, including query-independent duplicate checks.`)
