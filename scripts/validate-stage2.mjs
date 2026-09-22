import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')
const checks = []
const assert = (condition, message) => { if (!condition) throw new Error(message); checks.push(message) }

const page = readJson('cms/src/api/page/content-types/page/schema.json')
const pageComponents = page.attributes.sections.components
assert(pageComponents.includes('shared.hero'), 'Page supports Hero sections')
assert(pageComponents.includes('shared.carousel'), 'Page supports Carousel sections')
assert(pageComponents.includes('shared.cta'), 'Page supports CTA sections')
assert(page.attributes.seo.component === 'shared.seo', 'Page has reusable SEO')
assert(!page.attributes.path.unique, 'Page path is not globally unique')

for (const [label, file, fields] of [
  ['Job', 'cms/src/api/job/content-types/job/schema.json', ['title', 'slug', 'employmentType', 'applicationStatus', 'mode', 'seo']],
  ['Office', 'cms/src/api/office/content-types/office/schema.json', ['name', 'slug', 'city', 'country', 'mode', 'seo']],
  ['Leadership', 'cms/src/api/leadership-profile/content-types/leadership-profile/schema.json', ['name', 'slug', 'position', 'mode', 'seo']],
  ['Navigation', 'cms/src/api/navigation-item/content-types/navigation-item/schema.json', ['label', 'href', 'group', 'visible', 'mode']],
  ['Footer', 'cms/src/api/footer/content-types/footer/schema.json', ['mode', 'usefulLinks', 'legalLinks', 'socialLinks']],
]) {
  const schema = readJson(file)
  for (const field of fields) assert(Boolean(schema.attributes[field]), `${label} has ${field}`)
  assert(schema.options.draftAndPublish === true, `${label} supports draft and publish`)
}

for (const relativePath of [
  'cms/src/components/shared/seo.json',
  'cms/src/components/shared/media.json',
  'cms/src/api/page/content-types/page/lifecycles.ts',
  'cms/src/index.ts',
  'components/cms-page.tsx',
]) assert(fs.existsSync(path.join(root, relativePath)), `${relativePath} exists`)

assert(readText('lib/strapi.ts').includes('normalizeJob'), 'CMS adapter normalizes Jobs')
assert(readText('lib/strapi.ts').includes('normalizeOffice'), 'CMS adapter normalizes Offices')
assert(readText('lib/strapi.ts').includes('normalizeLeadership'), 'CMS adapter normalizes Leadership')
assert(readText('app/[[...slug]]/page.tsx').includes('content.jobs.find'), 'Careers detail route checks CMS Jobs')
assert(readText('app/[[...slug]]/page.tsx').includes('content.leadership.find'), 'Leadership detail route checks CMS profiles')
assert(readText('app/[[...slug]]/page.tsx').includes('content.offices.find'), 'Office detail route checks CMS offices')
assert(readText('app/sitemap.ts').includes('getStrapiPagePaths'), 'Sitemap reads CMS Page paths')

console.log(`Stage 2 contract validation passed (${checks.length} checks).`)
