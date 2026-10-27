import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function load(file) {
  const module = { exports: {} }
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(source, { module, exports: module.exports, Date })
  return module.exports
}
const { validateSubscription, storeSubscription } = load('cms/src/utils/newsletter.ts')
assert.equal(validateSubscription({ email: 'person@example.com' }), undefined)
assert.equal(validateSubscription({ email: 'bad', consent: true }), undefined)
assert.equal(validateSubscription({ email: `${'a'.repeat(260)}@example.com`, consent: true }), undefined)
const input = validateSubscription({ email: ' Person@Example.com ', consent: true, subscriptionStatus: 'subscribed', source: 'forged', mode: 'global' })
assert.equal(input.email, 'person@example.com')
assert.equal(input.subscriptionStatus, undefined)
const records = new Map()
const store = { find: async email => records.get(email), create: async data => records.set(data.email, data) }
await storeSubscription(store, input)
assert.equal(records.get(input.email).subscriptionStatus, 'pending')
assert.equal(records.get(input.email).source, 'website-footer')
assert.equal(records.get(input.email).consentVersion, 'newsletter-v1')
assert.ok(records.get(input.email).consentAt)
await storeSubscription(store, input)
assert.equal(records.size, 1)
records.get(input.email).subscriptionStatus = 'unsubscribed'
await storeSubscription(store, input)
assert.equal(records.get(input.email).subscriptionStatus, 'unsubscribed')
await assert.rejects(storeSubscription({ find: async () => undefined, create: async () => { throw Error('storage unavailable') } }, input), /storage unavailable/)
let createdByOtherRequest = false
await storeSubscription({ find: async () => createdByOtherRequest ? { email: input.email } : undefined, create: async () => { createdByOtherRequest = true; throw Error('unique email') } }, input)

const schema = JSON.parse(fs.readFileSync('cms/src/api/newsletter-subscriber/content-types/newsletter-subscriber/schema.json'))
assert.equal(schema.options.draftAndPublish, false)
assert.equal(schema.attributes.email.unique, true)
assert.match(fs.readFileSync('cms/src/api/newsletter/routes/newsletter.ts', 'utf8'), /routes: \[\]/)
console.log('Newsletter tests passed: consent, normalization, private draft routes, deduplication, opt-out preservation and failure handling.')

if (process.argv.includes('--integration')) {
  const { createRequire } = await import('node:module')
  const require = createRequire(new URL('../cms/package.json', import.meta.url))
  const Database = require('better-sqlite3')
  const db = new Database(new URL('../cms/.tmp/data.db', import.meta.url).pathname)
  const email = `newsletter-test-${Date.now()}@example.com`
  const origin = process.env.STRAPI_URL || 'http://localhost:1337'
  if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Integration tests run against local CMS only.')
  const website = 'http://localhost:3000'
  const subscribe = data => fetch(`${website}/api/newsletter`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': email }, body: JSON.stringify(data) })
  try {
    assert.equal((await fetch(`${origin}/api/newsletter-subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 403)
    for (const path of ['newsletter-subscriptions', 'newsletter-subscribers', 'newsletters']) assert.ok([404, 405].includes((await fetch(`${origin}/api/${path}`)).status))
    assert.equal((await subscribe({ email })).status, 400)
    assert.equal((await subscribe({ email: 'not-an-email', consent: true })).status, 400)
    assert.equal((await subscribe({ email: email.toUpperCase(), consent: true, mode: 'global' })).status, 200)
    let row = db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(email)
    assert.ok(row)
    assert.equal(row.subscription_status, 'pending')
    assert.equal(row.mode, 'global')
    assert.equal(row.consent_version, 'newsletter-v1')
    assert.equal((await subscribe({ email, consent: true })).status, 200)
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM newsletter_subscribers WHERE email = ?').get(email).count, 1)
    db.prepare('UPDATE newsletter_subscribers SET subscription_status = ? WHERE email = ?').run('unsubscribed', email)
    assert.equal((await subscribe({ email, consent: true })).status, 200)
    row = db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(email)
    assert.equal(row.subscription_status, 'unsubscribed')
    console.log('Local integration passed: website signup persists consent, normalizes addresses, avoids duplicates, preserves opt-outs, and blocks public CMS access.')
  } finally {
    db.prepare('DELETE FROM newsletter_subscribers WHERE email = ?').run(email)
    db.close()
  }
}
