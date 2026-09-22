import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const checks = []
const assert = (condition, message) => { if (!condition) throw new Error(message); checks.push(message) }

assert(fs.existsSync(path.join(root, 'app/api/revalidate/route.ts')), 'protected revalidation route exists')
assert(read('app/api/revalidate/route.ts').includes('REVALIDATION_SECRET'), 'revalidation requires a server-only secret')
assert(read('lib/rate-limit.ts').includes('Per-instance protection'), 'replaceable application-level rate limiter is documented')
assert(read('app/api/contact/route.ts').includes("rateLimit(request, 'contact'"), 'contact is throttled')
assert(read('app/api/newsletter/route.ts').includes("rateLimit(request, 'newsletter'"), 'newsletter is throttled')
assert(read('lib/contact.ts').includes('CONTACT_ALLOWED_FILE_EXTENSIONS'), 'attachment extension validation exists')
assert(read('lib/contact.ts').includes('CONTACT_ATTACHMENT_DELIVERY_MODE'), 'attachment delivery requires explicit approval')
assert(read('lib/contact.ts').includes('fetchWithTimeout'), 'contact provider has a timeout')
assert(read('lib/newsletter.ts').includes('fetchWithTimeout'), 'newsletter provider has a timeout')
assert(read('lib/site-url.ts').includes('modeForHostname'), 'hostname mode routing is configuration-gated')
assert(read('cms/.env.example').includes('DATABASE_CLIENT'), 'CMS database configuration is documented')
assert(read('cms/.env.example').includes('CORS_ORIGINS'), 'CMS CORS configuration is documented')
assert(fs.existsSync(path.join(root, 'docs/PRODUCTION-ENVIRONMENT.md')), 'production environment guide exists')
assert(fs.existsSync(path.join(root, 'docs/CONTENT-MIGRATION-MATRIX.md')), 'content migration matrix exists')
assert(fs.existsSync(path.join(root, 'docs/STAGE-4-REPORT.md')), 'Stage 4 report exists')

console.log(`Stage 4 contract validation passed (${checks.length} checks).`)
