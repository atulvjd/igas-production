import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const require = createRequire(import.meta.url)

function loadTypeScript(file, processValue = process) {
  const source = read(file)
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(output, {
    exports: module.exports,
    module,
    require,
    process: processValue,
    FormData,
    File,
    Response,
    Uint8Array,
    TextDecoder,
  }, { filename: file })
  return module.exports
}

const contact = loadTypeScript('lib/contact.ts')
const validContact = new FormData()
validContact.set('name', 'Test User')
validContact.set('email', 'test@example.com')
validContact.set('message', 'A test enquiry')
validContact.set('consent', 'true')
assert.equal(contact.validateContactForm(validContact).value.value.consent, true)

const copyFormData = (source) => {
  const copy = new FormData()
  for (const [key, value] of source.entries()) copy.append(key, value)
  return copy
}

const missingConsent = copyFormData(validContact)
missingConsent.delete('consent')
assert.match(contact.validateContactForm(missingConsent).error, /confirm/)

const invalidEmail = copyFormData(validContact)
invalidEmail.set('email', 'not-an-email')
assert.match(contact.validateContactForm(invalidEmail).error, /valid work email/)

const missingMessage = copyFormData(validContact)
missingMessage.delete('message')
assert.match(contact.validateContactForm(missingMessage).error, /required/)

const newsletter = loadTypeScript('lib/newsletter.ts')
assert.equal(newsletter.validateNewsletterEmail('person@example.com').email, 'person@example.com')
assert.match(newsletter.validateNewsletterEmail('invalid').error, /valid email/)

const requestBody = loadTypeScript('lib/request-body.ts')
const multipart = new FormData()
multipart.set('name', 'Test User')
const parsed = await requestBody.readLimitedFormData(new Request('http://localhost/api/contact', {
  method: 'POST',
  body: multipart,
}), 1024)
assert.equal(parsed.get('name'), 'Test User')

await assert.rejects(
  requestBody.readRequestBody(new Request('http://localhost/api/newsletter', {
    method: 'POST',
    body: 'x'.repeat(100),
  }), 32),
  requestBody.RequestBodyTooLargeError,
)

const routes = loadTypeScript('lib/routes.ts')
assert.equal(routes.isValidCmsPagePath('/published-cms-page'), true)
assert.equal(routes.isValidCmsPagePath('/privacy'), true)
assert.equal(routes.isValidCmsPagePath('/services'), false)
assert.equal(routes.isValidCmsPagePath('//external.example/path'), false)
assert.equal(routes.isValidCmsPagePath('/custom?query=1'), false)
assert.equal(routes.getSingleSegmentSlug('/offices/mumbai/nested', '/offices/'), undefined)

const siteUrl = loadTypeScript('lib/site-url.ts', { env: { NODE_ENV: 'production' } })
assert.throws(() => siteUrl.getSiteUrl(), /NEXT_PUBLIC_SITE_URL must be configured/)

const contactFormSource = read('components/contact-page.tsx')
const analyticsSource = read('components/consent-aware-analytics.tsx')
assert.match(contactFormSource, /consentText \|\| 'I agree to be contacted by IGAS about this enquiry\.'/)
assert.match(contactFormSource, /finally\s*\{/)
assert.match(read('components/igas-site.tsx'), /beforeSend|COOKIE_EVENT|analyticsAllowed/)
assert.match(analyticsSource, /hasAnalyticsConsent\(\) \? event : null/)

console.log('Readiness fix tests passed (19 checks).')
