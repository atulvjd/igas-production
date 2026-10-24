import fs from 'node:fs/promises'
import { articles, articleTakeaways, newIndustries, focusAreas, serviceSections } from './content/editorial-expansion.mjs'
import { policies, policyDate } from './content/website-policies.mjs'

// Run: node --env-file=.env.local --env-file=.env.cms-edit.local scripts/expand-editorial-content.mjs
const base = process.env.CMS_EDIT_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local CMS only.')
if (!process.env.CMS_EDIT_API_TOKEN) throw new Error('CMS_EDIT_API_TOKEN is required.')
const headers = { Authorization: `Bearer ${process.env.CMS_EDIT_API_TOKEN}`, 'Content-Type': 'application/json' }
async function api(endpoint, method = 'GET', data) {
  const response = await fetch(`${base}/api/${endpoint}`, { method, headers, body: data ? JSON.stringify({ data }) : undefined, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${method} ${endpoint}: HTTP ${response.status} ${(await response.json()).error?.message || ''}`)
  return (await response.json()).data
}
const names = ['articles', 'industries', 'services', 'focus-areas', 'pages', 'footers']
const snapshot = {}
for (const name of names) {
  snapshot[name] = {}
  for (const status of ['draft', 'published']) snapshot[name][status] = await api(`${name}?status=${status}&pagination[pageSize]=100&${name === 'pages' ? 'populate[sections][populate]=*' : 'populate=*'}`)
}
const directory = `cms/.tmp/editorial-expansion-${new Date().toISOString().replace(/[:.]/g, '-')}`
await fs.mkdir(directory, { recursive: true, mode: 0o700 })
await fs.writeFile(`${directory}/before.json`, JSON.stringify(snapshot, null, 2), { mode: 0o600 })
const journal = []
const clean = value => JSON.parse(JSON.stringify(value, (key, item) => key === 'id' ? undefined : item))
const p = text => ({ type: 'paragraph', children: [{ type: 'text', text }] })
const h = text => ({ type: 'heading', level: 2, children: [{ type: 'text', text }] })
const blocks = sections => sections.flatMap(([title, text]) => [h(title), p(text)])
const seo = (title, description) => ({ metaTitle: title.slice(0, 60), metaDescription: description.slice(0, 160), noIndex: false })
const records = name => snapshot[name].published
const idFor = (name, slug) => records(name).find(item => item.slug === slug)?.documentId
const ids = (name, slugs) => slugs.map(slug => idFor(name, slug)).filter(Boolean)
async function save(name, match, data) {
  const existing = snapshot[name].draft.find(match)
  const record = await api(`${name}${existing ? `/${existing.documentId}` : ''}?status=published`, existing ? 'PUT' : 'POST', clean(data))
  const verified = await api(`${name}/${record.documentId}?status=published${name === 'pages' ? '&populate[sections][populate]=*' : '&populate=*'}`)
  if (!verified.publishedAt) throw new Error(`Not published: ${name}/${record.documentId}`)
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && verified[key] !== value) throw new Error(`Verification failed: ${name}.${key}`)
    if (['content', 'fullContent', 'sections'].includes(key) && verified[key]?.length !== value.length) throw new Error(`Incomplete body: ${name}.${key}`)
  }
  snapshot[name].draft = [...snapshot[name].draft.filter(item => item.documentId !== record.documentId), verified]
  snapshot[name].published = [...snapshot[name].published.filter(item => item.documentId !== record.documentId), verified]
  journal.push({ collection: name, documentId: record.documentId, title: verified.title || verified.mode, fields: Object.keys(data) })
  await fs.writeFile(`${directory}/changes.json`, JSON.stringify(journal, null, 2), { mode: 0o600 })
  console.log(`Published and verified: ${name} / ${verified.title || verified.mode}`)
  return verified
}
const image = {
  finance: records('industries').find(item => item.slug === 'financial-services')?.imageUrl,
  manufacturing: records('industries').find(item => item.slug === 'manufacturing')?.imageUrl,
  healthcare: records('industries').find(item => item.slug === 'healthcare')?.imageUrl,
  technology: records('industries').find(item => item.slug === 'technology')?.imageUrl,
  teamwork: records('articles').find(item => item.slug === 'technology-catalyst-for-change')?.imageUrl,
  discussion: records('articles').find(item => item.slug === 'building-resilient-organizations')?.imageUrl,
  analysis: records('articles').find(item => item.slug === 'rethinking-risk-connected-world')?.imageUrl,
  planning: records('articles').find(item => item.slug === 'future-of-business-transformation')?.imageUrl,
}
for (const [index, [title, slug, shortDescription, description, services, imageKey, heading, text]] of newIndustries.entries()) {
  if (!image[imageKey]) throw new Error(`Missing editorial image: ${imageKey}`)
  await save('industries', item => item.slug === slug && item.mode === 'india', {
    title, slug, shortDescription, description, mode: 'india', sortOrder: 5 + index,
    imageUrl: image[imageKey], imageAlt: `Editorial illustration for ${title.toLowerCase()} business; not an IGAS client or premises photograph`,
    fullContent: [p(description), ...blocks([
      [heading, text],
      ['Our professional-service perspective', 'The firm profile describes active senior-partner involvement, industry understanding and practical guidance customised to each situation. A discussion can bring together financial records, reporting routines, tax questions, internal controls and plans for business change. The appropriate scope depends on the organisation and the decision it needs to make.'],
      ['Prepare for a useful conversation', 'Describe your operating model, the question you are working through and the outcome you need. Identify the records available and the people who can explain them. An initial discussion helps establish priorities, information requirements and the boundaries between business support and other specialist professional work.'],
    ])],
    relatedServices: ids('services', services), seo: seo(`${title} | IGAS`, shortDescription),
  })
}
for (const industry of records('industries').filter(item => !newIndustries.some(entry => entry[1] === item.slug))) {
  const heading = 'A practical starting point for your sector'
  if (!JSON.stringify(industry.fullContent).includes(heading)) await save('industries', item => item.documentId === industry.documentId, {
    fullContent: [...(industry.fullContent || []), ...blocks([
      [heading, `Begin with how your ${industry.title.toLowerCase()} business operates: the activities behind revenue, the commitments needed for delivery and the information management reviews. Identify where records are difficult to reconcile or responsibilities need clarification. This context helps turn a broad request for support into a focused set of questions.`],
      ['Connect information with responsibilities', 'A useful engagement makes the work, owners and next steps understandable. Agree the scope, the records needed and how significant questions will be reviewed. Sector experience informs the discussion, while conclusions about a particular transaction or reporting requirement depend on the relevant facts.'],
    ])],
  })
}
for (const [sortOrder, [title, slug, industries, description]] of focusAreas.entries()) await save('focus-areas', item => item.slug === slug && item.mode === 'india', { title, slug, description, industries: ids('industries', industries), mode: 'india', sortOrder })
for (const service of records('services')) {
  const sections = serviceSections[service.slug]
  if (!sections) continue
  const additions = sections.filter(([title]) => !JSON.stringify(service.fullContent).includes(title))
  if (additions.length) await save('services', item => item.documentId === service.documentId, { fullContent: [...(service.fullContent || []), ...blocks(additions)] })
}
const existingCategories = {
  'future-of-business-transformation': 'Business Transformation',
  'navigating-growth-changing-economy': 'Business Advisory',
  'technology-catalyst-for-change': 'Technology',
  'rethinking-risk-connected-world': 'Risk & Governance',
  'building-resilient-organizations': 'Strategy',
}
for (const record of records('articles').filter(item => existingCategories[item.slug])) await save('articles', item => item.documentId === record.documentId, { category: existingCategories[record.slug] })
for (const [index, article] of articles.entries()) {
  if (!image[article.image]) throw new Error(`Missing article image: ${article.image}`)
  await save('articles', item => item.slug === article.slug, {
    title: article.title, slug: article.slug, excerpt: article.excerpt, category: article.category,
    date: '2026-10-24', publicationDate: '2026-10-24', sortOrder: index, author: 'IGAS Editorial', contentType: 'insight', featured: false, mode: null,
    imageUrl: image[article.image], imageAlt: `Editorial illustration: ${article.title.toLowerCase()}`,
    content: [p(article.excerpt), ...blocks(article.sections), h('Practical takeaways'), { type: 'list', format: 'unordered', children: articleTakeaways[article.slug].map(text => ({ type: 'list-item', children: [{ type: 'text', text }] })) }],
    relatedServices: ids('services', article.services), relatedIndustries: ids('industries', article.industries),
    seo: seo(article.title, article.excerpt),
  })
}
for (const article of articles) {
  const record = records('articles').find(item => item.slug === article.slug)
  const peers = [...articles.filter(item => item.slug !== article.slug && item.category === article.category), ...articles.filter(item => item.slug !== article.slug && item.category !== article.category)].slice(0, 3)
  await save('articles', item => item.documentId === record.documentId, { relatedArticles: ids('articles', peers.map(item => item.slug)) })
}
for (const service of records('services')) {
  const related = articles.filter(item => item.services.includes(service.slug)).map(item => idFor('articles', item.slug))
  const retained = (service.relatedArticles || []).map(item => item.documentId)
  if (related.length) await save('services', item => item.documentId === service.documentId, { relatedArticles: [...new Set([...retained, ...related])].filter(Boolean) })
}
for (const industry of records('industries')) {
  const related = articles.filter(item => item.industries.includes(industry.slug)).map(item => idFor('articles', item.slug))
  const retained = (industry.relatedArticles || []).map(item => item.documentId)
  // Every sector gets at least one practical reading link.
  await save('industries', item => item.documentId === industry.documentId, { relatedArticles: [...new Set([...retained, ...(related.length ? related : [idFor('articles', 'management-reporting-decisions')])])].filter(Boolean) })
}
for (const policy of policies) for (const mode of ['india', 'global']) {
  const links = policy.links.map(([label, url]) => ({ type: 'paragraph', children: [{ type: 'link', url, children: [{ type: 'text', text: label }] }] }))
  await save('pages', item => item.path === policy.path && item.mode === mode, {
    title: policy.title, path: policy.path, mode, description: policy.description, seo: seo(`${policy.title} | IGAS`, policy.description),
    sections: [{ __component: 'shared.rich-text', eyebrow: `Last updated ${policyDate}`, title: policy.heading, theme: 'light', body: [...blocks(policy.sections), h('Related information'), ...links] }],
  })
}
for (const footer of records('footers')) await save('footers', item => item.documentId === footer.documentId, {
  legalLinks: policies.map((policy, order) => ({ label: policy.title, href: policy.path, external: false, order })),
})
if (process.env.REVALIDATION_SECRET) {
  const response = await fetch('http://localhost:3000/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` }, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`Cache refresh: HTTP ${response.status}`)
}
console.log(`Completed ${journal.length} verified updates. Backups: ${directory}/before.json`)
console.log(JSON.stringify({ articles: records('articles').length, industries: records('industries').length, focusAreas: records('focus-areas').length, publishedPolicies: policies.length, policyModes: ['india', 'global'] }))
