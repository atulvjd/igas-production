import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const compiled = ts.transpileModule(fs.readFileSync('lib/cookie-consent.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
function browser({ cookieThrows = false, storageThrows = false, storageWriteThrows = false, stored = new Map(), cookie = { value: '' } } = {}) {
  const events = []
  const window = { location: { protocol: 'http:' }, dispatchEvent: event => events.push(event.type) }
  Object.defineProperty(window, 'localStorage', { get() {
    if (storageThrows) throw Error('Storage blocked')
    return { getItem: key => stored.get(key) || null, setItem: (key, value) => { if (storageWriteThrows) throw Error('Storage writes blocked'); stored.set(key, value) } }
  } })
  const document = {}
  Object.defineProperty(document, 'cookie', { get() { if (cookieThrows) throw Error('Cookies blocked'); return cookie.value }, set(value) { if (cookieThrows) throw Error('Cookies blocked'); cookie.value = value.split(';')[0] } })
  const module = { exports: {} }
  vm.runInNewContext(compiled, { module, exports: module.exports, window, document, Event, Date })
  return { ...module.exports, events, stored, cookie }
}
let b = browser()
assert.equal(b.readConsent(), null)
b.saveConsent(true)
assert.equal(b.cookie.value, 'igas-consent=analytics')
assert.equal(b.hasAnalyticsConsent(), true)
assert.deepEqual(b.events, ['igas-consent-change'])
assert.equal(browser({ stored: b.stored, cookie: b.cookie }).hasAnalyticsConsent(), true)
b.saveConsent(false)
assert.equal(b.hasAnalyticsConsent(), false)
assert.equal(b.cookie.value, 'igas-consent=essential')

b = browser({ cookieThrows: true })
assert.doesNotThrow(() => b.saveConsent(true))
assert.equal(browser({ cookieThrows: true, stored: b.stored }).hasAnalyticsConsent(), true)

b = browser({ cookieThrows: true, storageThrows: true })
assert.equal(b.readConsent(), null)
assert.doesNotThrow(() => b.saveConsent(true))
assert.equal(b.hasAnalyticsConsent(), true)
b.saveConsent(false)
assert.equal(b.hasAnalyticsConsent(), false)

const stored = new Map([['igas-consent-preference', JSON.stringify({ analytics: true, expiresAt: Date.now() + 100000 })]])
b = browser({ cookieThrows: true, storageWriteThrows: true, stored })
b.saveConsent(false)
assert.equal(b.hasAnalyticsConsent(), false, 'Stale stored opt-in must not override a new opt-out')
stored.set('igas-consent-preference', JSON.stringify({ analytics: false, expiresAt: Date.now() + 100000 }))
b.refreshConsentFromStorage()
assert.equal(b.hasAnalyticsConsent(), false)

for (const value of ['broken JSON', JSON.stringify({ analytics: true, expiresAt: Date.now() - 1 }), JSON.stringify({ analytics: 'yes', expiresAt: Date.now() + 10000 })]) {
  assert.equal(browser({ stored: new Map([['igas-consent-preference', value]]) }).readConsent(), null)
}
assert.equal(browser({ cookie: { value: 'other=ok;igas-consent=analytics' } }).hasAnalyticsConsent(), true)
assert.equal(browser({ cookie: { value: 'igas-consent=all' } }).hasAnalyticsConsent(), true)
assert.equal(browser({ cookie: { value: 'igas-consent=unknown' } }).readConsent(), null)
console.log('Consent regression checks passed: accept, reject, reload, blocked cookies/storage, stale opt-in, expiry, malformed storage, legacy cookies and change events.')
