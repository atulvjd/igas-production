import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const checks = []
const assert = (condition, message) => { if (!condition) throw new Error(message); checks.push(message) }

assert(fs.existsSync(path.join(root, 'app/api/contact/route.ts')), 'contact server route exists')
assert(fs.existsSync(path.join(root, 'app/api/newsletter/route.ts')), 'newsletter server route exists')
assert(read('lib/contact.ts').includes('CONTACT_MAX_FILE_SIZE'), 'contact attachment size policy exists')
assert(read('lib/contact.ts').includes('CONTACT_ALLOWED_FILE_TYPES'), 'contact attachment type policy exists')
assert(read('lib/contact.ts').includes('CONTACT_WEBHOOK_URL'), 'contact delivery adapter exists')
assert(read('lib/newsletter.ts').includes('NEWSLETTER_WEBHOOK_URL'), 'newsletter delivery adapter exists')
assert(read('components/contact-page.tsx').includes("fetch('/api/contact'"), 'contact UI uses server endpoint')
assert(read('components/cms-page.tsx').includes('shared.contact-form'), 'CMS Pages support Contact Form sections')
assert(read('components/igas-site.tsx').includes("fetch('/api/newsletter'"), 'newsletter UI uses server endpoint')
assert(read('components/igas-site.tsx').includes('CmsChromeContext'), 'shared CMS chrome context exists')
assert(read('app/[[...slug]]/page.tsx').includes('CmsChromeProvider'), 'legacy routes use CMS chrome provider')
assert(read('lib/site-url.ts').includes('NEXT_PUBLIC_INDIA_SITE_URL'), 'India canonical origin is configurable')
assert(read('lib/site-url.ts').includes('NEXT_PUBLIC_GLOBAL_SITE_URL'), 'Global canonical origin is configurable')
assert(read('app/sitemap.ts').includes('lastModified'), 'sitemap carries CMS timestamps')
assert(read('cms/config/middlewares.ts').includes('CORS_ORIGINS'), 'CMS CORS is environment-configured')
assert(read('.env.example').includes('CONTACT_WEBHOOK_URL'), 'contact environment placeholders documented')
assert(read('.env.example').includes('NEWSLETTER_WEBHOOK_URL'), 'newsletter environment placeholders documented')

console.log(`Stage 3 contract validation passed (${checks.length} checks).`)
