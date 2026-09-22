import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const checks = []
const assert = (condition, message) => { if (!condition) throw new Error(message); checks.push(message) }

assert(read('.env.example').includes('ALLOW_INDEXING'), 'indexing is deployment-configured')
assert(read('app/robots.ts').includes('isIndexingEnabled'), 'robots blocks unapproved environments')
assert(read('app/sitemap.ts').includes('isIndexingEnabled'), 'sitemap excludes unapproved environments')
assert(read('app/layout.tsx').includes('robots: isIndexingEnabled()'), 'page metadata no-indexes unapproved environments')
assert(!read('.env.example').includes('NEXT_PUBLIC_STRAPI_API_TOKEN'), 'no Strapi token is publicly configured')
assert(!read('.env.example').includes('NEXT_PUBLIC_REVALIDATION_SECRET'), 'no revalidation secret is publicly configured')
assert(fs.existsSync(path.join(root, 'docs/PRODUCTION-QA-CHECKLIST.md')), 'production QA checklist exists')
assert(fs.existsSync(path.join(root, 'docs/CLIENT-HANDOVER.md')), 'client handover guide exists')
assert(fs.existsSync(path.join(root, 'docs/MEDIA-MIGRATION-CHECKLIST.md')), 'media migration checklist exists')
assert(fs.existsSync(path.join(root, 'docs/DEPLOYMENT-RUNBOOK.md')), 'deployment runbook exists')
assert(fs.existsSync(path.join(root, 'docs/STAGE-5-REPORT.md')), 'Stage 5 report exists')
assert(read('docs/PRODUCTION-QA-CHECKLIST.md').includes('BLOCKED'), 'QA checklist records blockers')

console.log(`Stage 5 contract validation passed (${checks.length} checks).`)
