import fs from 'node:fs/promises'
import path from 'node:path'

// Run with: node --env-file=.env.local --env-file=.env.cms-edit.local scripts/populate-local-cms.mjs
// Content editing credentials remain separate from the website's read-only token.
const base = process.env.CMS_EDIT_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('This content fill is restricted to the local CMS.')
if (!process.env.CMS_EDIT_API_TOKEN) throw new Error('CMS_EDIT_API_TOKEN is required.')
const headers = { Authorization: `Bearer ${process.env.CMS_EDIT_API_TOKEN}`, 'content-type': 'application/json' }
const collections = ['services', 'industries', 'articles', 'focus-areas', 'jobs', 'offices', 'leadership-profiles', 'navigation-items', 'footers', 'site-settings', 'pages']
const backupDir = path.join('cms/.tmp', `content-fill-${new Date().toISOString().replace(/[:.]/g, '-')}`)
await fs.mkdir(backupDir, { recursive: true, mode: 0o700 })
const journal = []
async function api(endpoint, method = 'GET', data) {
  const response = await fetch(`${base}/api/${endpoint}`, { method, headers, body: data ? JSON.stringify({ data }) : undefined, signal: AbortSignal.timeout(20000) })
  const body = response.status === 204 ? null : await response.json()
  if (!response.ok) throw new Error(`${method} ${endpoint}: ${response.status} ${body?.error?.message || 'request failed'}`)
  return body?.data
}
const snapshot = {}
for (const name of collections) {
  snapshot[name] = {}
  for (const status of ['draft', 'published']) snapshot[name][status] = await api(`${name}?status=${status}&populate=*&pagination[pageSize]=100`)
}
await fs.writeFile(path.join(backupDir, 'before.json'), JSON.stringify(snapshot, null, 2), { mode: 0o600 })
console.log(`Content snapshot saved to ${backupDir}/before.json`)

const paragraph = (text) => ({ type: 'paragraph', children: [{ type: 'text', text }] })
const heading = (text) => ({ type: 'heading', level: 2, children: [{ type: 'text', text }] })
const blocks = (...sections) => sections.flatMap(([title, ...copy]) => [heading(title), ...copy.map(paragraph)])
const seo = (title, description, noIndex = false) => ({ metaTitle: title.slice(0, 60), metaDescription: description.slice(0, 160), ogTitle: title.slice(0, 60), ogDescription: description.slice(0, 160), noIndex })
const cleanComponent = (value) => JSON.parse(JSON.stringify(value, (key, item) => key === 'id' ? undefined : item))
const published = (name) => snapshot[name].published
const bySlug = (name, slug) => published(name).find((record) => record.slug === slug)
const ids = (name, slugs) => slugs.map((slug) => bySlug(name, slug)?.documentId).filter(Boolean)
async function save(name, match, data, publish = true) {
  const existing = snapshot[name].draft.find(match)
  const endpoint = existing ? `${name}/${existing.documentId}` : name
  const record = await api(`${endpoint}?status=${publish ? 'published' : 'draft'}`, existing ? 'PUT' : 'POST', data)
  const item = { collection: name, documentId: record.documentId, title: record.title || record.name || record.label || record.mode, status: publish ? 'published' : 'draft', action: existing ? 'updated' : 'created' }
  journal.push(item)
  await fs.writeFile(path.join(backupDir, 'changes.json'), JSON.stringify(journal, null, 2), { mode: 0o600 })
  console.log(`${item.action} ${name}: ${item.title} (${item.status})`)
  snapshot[name].draft = [...snapshot[name].draft.filter((entry) => entry.documentId !== record.documentId), record]
  if (publish) snapshot[name].published = [...snapshot[name].published.filter((entry) => entry.documentId !== record.documentId), record]
  return record
}

const servicesCopy = {
  'tax-regulatory': {
    description: 'Bring structure to tax and regulatory responsibilities. IGAS helps businesses organise information, understand compliance priorities and connect tax considerations with day-to-day commercial decisions.',
    shortDescription: 'Practical support for tax planning, compliance readiness and the regulatory questions that accompany business growth.', tag: 'Tax & regulatory',
    fullContent: blocks(['A clearer view of your responsibilities', 'Tax and regulatory requirements touch transactions, reporting and business planning. A structured view of those responsibilities helps teams identify what needs attention and prepare the information needed for informed discussions.'], ['Support built around your business', 'Our approach brings together a review of business activities, financial information and compliance workflows. The scope can include tax compliance support, transaction-related questions and coordination with your finance team.'], ['Turn priorities into a practical plan', 'Start with the questions you are trying to resolve. We work towards an agreed scope, clear responsibilities and a realistic action plan. Specific tax positions depend on the facts and applicable requirements.']),
  },
  'risk-compliance': {
    description: 'Understand where your business is exposed and where controls can work better. IGAS supports a practical approach to risk, internal processes and compliance responsibilities so teams can act with greater clarity.',
    shortDescription: 'Connect business risks, internal controls and compliance responsibilities with practical improvements your team can implement.', tag: 'Risk & compliance',
    fullContent: blocks(['Start with the decisions that matter', 'Risk management becomes more useful when it is connected to real operations. We look at how decisions are made, where information moves and which dependencies deserve closer attention.'], ['Build controls that fit the work', 'A review can consider process documentation, reporting routines, responsibility gaps and control design. The aim is to identify priorities that fit the size, complexity and operating context of your business.'], ['Make improvement manageable', 'Clear ownership and a sensible implementation sequence help turn findings into action. We focus on practical recommendations and transparent conversations about the work required.']),
  },
  'business-transformation': {
    description: 'Move from a broad ambition for change to a defined set of priorities. IGAS helps businesses review processes, financial information and operating models to plan practical improvements and support sustainable growth.',
    shortDescription: 'Shape a practical roadmap for stronger processes, clearer financial information and more effective ways of working.', tag: 'Business transformation',
    fullContent: blocks(['Define what needs to change', 'Growth can expose processes and reporting routines that no longer fit the business. We begin by understanding the current situation, the desired outcome and the constraints that shape delivery.'], ['Connect strategy with operations', 'A transformation discussion can bring together operating processes, financial visibility, technology requirements and team responsibilities. The priority is to identify changes that address a clear business need.'], ['Create a roadmap people can use', 'A useful roadmap makes the sequence, owners and measures of progress visible. We help turn opportunities into manageable workstreams so teams can move forward with a shared understanding of the next steps.']),
  },
}
for (const [index, service] of published('services').entries()) {
  const copy = servicesCopy[service.slug]
  const data = { title: service.title.trim(), sortOrder: index, tag: service.tag || copy?.tag || service.title.trim(), seo: service.seo || seo(service.title.trim(), service.shortDescription || copy?.shortDescription || 'Explore IGAS services for clearer financial information, practical business advice and better decisions.'), relatedIndustries: ids('industries', ['financial-services', 'manufacturing', 'technology']), relatedArticles: ids('articles', service.slug === 'risk-compliance' ? ['rethinking-risk-connected-world', 'building-resilient-organizations'] : ['navigating-growth-changing-economy', 'future-of-business-transformation']) }
  if (!service.description && copy) data.description = copy.description
  if (!service.shortDescription && copy) data.shortDescription = copy.shortDescription
  if (!service.fullContent?.length && copy) data.fullContent = copy.fullContent
  await save('services', (entry) => entry.slug === service.slug, data)
}
for (const [index, industry] of published('industries').entries()) {
  await save('industries', (entry) => entry.slug === industry.slug, {
    sortOrder: index, imageAlt: industry.imageAlt || `${industry.title} industry perspective`,
    seo: industry.seo || seo(`${industry.title} | IGAS`, industry.shortDescription || industry.description),
    relatedServices: ids('services', ['advisory-consulting', 'audit-assurance', 'risk-compliance']),
    relatedArticles: ids('articles', industry.slug === 'technology' ? ['technology-catalyst-for-change', 'future-of-business-transformation'] : ['building-resilient-organizations', 'navigating-growth-changing-economy']),
  })
}
for (const article of published('articles')) {
  await save('articles', (entry) => entry.slug === article.slug, {
    category: article.category === 'RIsk' ? 'Risk' : article.category,
    imageAlt: article.imageAlt || `Editorial illustration for ${article.title}`,
    seo: article.seo || seo(article.title, article.excerpt),
    relatedArticles: published('articles').filter((entry) => entry.slug !== article.slug).slice(0, 2).map((entry) => entry.documentId),
    relatedServices: ids('services', ['advisory-consulting', 'business-transformation']),
    relatedIndustries: ids('industries', ['technology', 'financial-services']),
  })
}

for (const [sortOrder, [title, slug, description, industries]] of [
  ['Finance & enterprise', 'finance-enterprise', 'The financial information, controls and commercial decisions behind a stronger business.', ['financial-services']],
  ['Innovation & creative business', 'innovation-creative-business', 'Perspectives for technology companies and creative businesses adapting to new opportunities.', ['technology', 'entertainment-media']],
  ['Essential industries', 'essential-industries', 'Practical financial and business perspectives for the organisations that make products and deliver care.', ['manufacturing', 'healthcare']],
].entries()) await save('focus-areas', (entry) => entry.slug === slug, { title, slug, description, industries: ids('industries', industries), mode: 'india', sortOrder })

const articleImages = published('articles').map((article) => article.imageUrl).filter(Boolean)
const stats = [
  { value: String(published('services').length), label: 'Service areas', detail: 'Explore advisory, audit, tax, risk and transformation.', active: true, sortOrder: 0 },
  { value: String(published('industries').length), label: 'Industry perspectives', detail: 'Find context for the sector in which you operate.', active: true, sortOrder: 1 },
  { value: String(published('articles').length), label: 'Published insights', detail: 'Read our current perspectives on business and change.', active: true, sortOrder: 2 },
]
const sharedSettings = {
  heroCtaHref: '/contact', heroImageUrl: articleImages[2], statementCtaLabel: 'Discover our approach', statementCtaHref: '/our-approach',
  aboutCtaLabel: 'Get to know IGAS', aboutCtaHref: '/about', aboutImageUrl: articleImages[1], careersImageUrl: articleImages[4],
  contactCtaLabel: 'Let’s talk', contactCtaHref: '/contact', searchLabel: 'Search IGAS', searchPlaceholder: 'Search services, industries and insights',
  contactEyebrow: 'Start a conversation', contactTitle: 'Tell us what is on your mind.',
  contactIntro: 'Whether you are reviewing your financial processes, planning a change or working through a business question, share a little about your situation and the support you are looking for.',
  contactConsentText: 'I agree to be contacted by IGAS about this enquiry.', contactSuccessMessage: 'Thank you. Your enquiry has been received.',
  contactEmail: published('footers')[0]?.contactEmail || '',
  cookieTitle: 'Your cookie choices', cookieDescription: 'Essential features help this website work. You can also allow analytics to help us understand how the site is used. Change your choice at any time using Cookie preferences.',
  cookieAcceptLabel: 'Allow analytics', cookieRejectLabel: 'Essential only', cookieManageLabel: 'Cookie preferences', cookieEssentialLabel: 'Essential features', cookieAnalyticsLabel: 'Allow analytics', cookieMarketingLabel: 'Marketing is not connected',
  statistics: stats,
}
const indiaSettings = published('site-settings').find((entry) => entry.mode === 'india')
const missingSettings = Object.fromEntries(Object.entries(sharedSettings).filter(([key]) => key === 'statistics' ? !indiaSettings?.statistics?.length : !indiaSettings?.[key]))
await save('site-settings', (entry) => entry.mode === 'india', { ...missingSettings, mode: 'india' })

const office = await save('offices', (entry) => entry.slug === 'demo-india-office', {
  name: '[Demo] India office', slug: 'demo-india-office', city: 'India office · Demo', country: 'India',
  address: 'Demo location — the approved office address will be added before launch.',
  description: blocks(['Preview location', 'This is an illustrative office record for reviewing the website layout. It does not represent a verified office address.'], ['Start with a conversation', 'Use the contact page to describe the support you need. Replace this record with the real office name, address, contact information and map coordinates before production.']),
  imageUrl: articleImages[1], imageAlt: 'Illustrative workplace image for the demo office', services: ids('services', ['advisory-consulting', 'audit-assurance', 'tax-regulatory']),
  mode: 'india', sortOrder: 0, seo: seo('Demo India office | IGAS', 'Illustrative office record for website preview. Address and contact details require replacement before launch.', true),
})
const leaders = []
for (const [sortOrder, [name, slug, position, serviceSlugs]] of [
  ['[Demo] Advisory lead', 'demo-advisory-lead', 'Advisory & Business Strategy · Demo profile', ['advisory-consulting', 'business-transformation']],
  ['[Demo] Assurance lead', 'demo-assurance-lead', 'Audit, Risk & Governance · Demo profile', ['audit-assurance', 'risk-compliance']],
].entries()) leaders.push(await save('leadership-profiles', (entry) => entry.slug === slug, {
  name, slug, position, mode: 'india', sortOrder,
  biography: blocks(['Illustrative leadership profile', 'This demonstration record shows how a leadership biography will appear. It is not a real person or a claim about the IGAS team.'], ['A practical approach to client work', 'The final biography can describe the person’s responsibilities, areas of focus and approach to working with clients. Add only approved qualifications, experience and professional memberships.'], ['Complete before launch', 'Replace this sample name and biography with the approved profile, portrait and contact information.']),
  relatedServices: ids('services', serviceSlugs), relatedIndustries: ids('industries', ['financial-services', 'manufacturing']),
  seo: seo(name, 'Illustrative leadership profile for website preview. Replace with approved team details before launch.', true),
}))
for (const service of published('services')) await save('services', (entry) => entry.slug === service.slug, { relatedLeadership: [leaders[service.slug === 'audit-assurance' || service.slug === 'risk-compliance' ? 1 : 0].documentId] })

for (const [sortOrder, [title, slug, department]] of [
  ['[Demo] Business advisory associate', 'demo-business-advisory-associate', 'Advisory'],
  ['[Demo] Audit & assurance associate', 'demo-audit-assurance-associate', 'Audit & assurance'],
].entries()) await save('jobs', (entry) => entry.slug === slug, {
  title, slug, department, shortDescription: 'Illustrative vacancy for website preview only. This is not an active recruitment advertisement.',
  employmentType: 'Full-time · Demo', location: 'Location to be confirmed · Demo', office: office.documentId,
  applicationStatus: 'open', applicationCTA: 'View contact page · Demo', applicationUrl: '/contact', mode: 'india', sortOrder,
  description: blocks(['Preview role', 'This example is provided to review the careers layout. No vacancy, salary, work arrangement or recruitment process is being confirmed.'], ['The work', 'A final role description can explain how the successful candidate will support client work, collaborate with colleagues and contribute to clear financial and business analysis.']),
  responsibilities: blocks(['Illustrative responsibilities', 'Support research, documentation and the preparation of clear working materials.', 'Collaborate with the team to understand client questions and track agreed tasks.', 'Maintain organised records and communicate progress clearly.']),
  requirements: blocks(['Illustrative requirements', 'Relevant study or practical experience appropriate to the final role.', 'Careful analysis, clear communication and an interest in learning.', 'Replace these examples with the hiring team’s approved requirements.']),
  benefits: blocks(['Working environment', 'Use this section for the approved learning opportunities, working arrangements and benefits. No benefit or employment commitment is made by this demonstration record.']),
  seo: seo(title, 'Demo vacancy for reviewing the careers layout. This is not an active recruitment advertisement.', true),
})

const approachSections = [
  { __component: 'shared.hero', eyebrow: 'The IGAS approach', title: 'A clear view. A practical way forward.', intro: 'Good advice starts with understanding the question. We connect financial information, business context and practical next steps.', imageUrl: articleImages[2], ctaLabel: 'Start a conversation', ctaHref: '/contact' },
  { __component: 'shared.rich-text', eyebrow: 'How we think', title: 'Begin with context, not assumptions.', theme: 'light', body: blocks(['Understand the situation', 'Every business question sits within a wider context. We start by understanding what is changing, what matters to your team and which decisions need to be made.'], ['Make the information useful', 'Clear financial information and a shared view of priorities create a better starting point for discussion. We focus on making the issues understandable and the next steps specific.']) },
  { __component: 'shared.image-text', eyebrow: 'How we work', title: 'Turn a question into an agreed scope.', body: 'Together, we define the work, the information needed and what a useful outcome looks like. Clear responsibilities and regular conversations keep the work connected to your priorities.', imageUrl: articleImages[1], imageAlt: 'Illustrative team collaboration', imageSide: 'left', ctaLabel: 'Explore our services', ctaHref: '/services' },
  { __component: 'shared.stats', eyebrow: 'Explore IGAS', title: 'Start with the topic that matters to you.', intro: 'Browse the service areas, sectors and insights currently available on this website.', items: stats },
  { __component: 'shared.quote', eyebrow: 'Our perspective', quote: 'Clarity in numbers. Confidence in decisions. Growth with purpose.', author: 'IGAS', signature: 'Independent thinking. Practical perspective.' },
  { __component: 'shared.carousel', eyebrow: 'Latest thinking', title: 'Keep a wider perspective.', slides: published('articles').map((article) => ({ title: article.title, excerpt: article.excerpt, category: article.category, date: article.date, imageUrl: article.imageUrl, imageAlt: article.imageAlt || article.title, href: `/latest-thinking/${article.slug}` })) },
  { __component: 'shared.cta', eyebrow: 'Take the next step', title: 'Bring us the question in front of you.', body: 'Explore our services or tell us what you are working through. A useful first conversation starts with your business and your priorities.', label: 'Talk to IGAS', href: '/contact', theme: 'dark' },
  { __component: 'shared.contact-form', eyebrow: 'Get in touch', title: 'Let’s explore what comes next.', intro: 'Share your question, the context and the kind of support you are looking for.', contactEmail: sharedSettings.contactEmail, consentText: sharedSettings.contactConsentText, successMessage: sharedSettings.contactSuccessMessage },
]
await save('pages', (entry) => entry.path === '/our-approach' && entry.mode === 'india', { path: '/our-approach', mode: 'india', title: 'Our approach', description: 'Independent thinking, clear financial information and practical support for the decisions ahead.', sections: approachSections, seo: seo('Our approach | IGAS', 'Discover how IGAS approaches business questions through context, clear information and practical next steps.') })
await save('pages', (entry) => entry.path === '/working-with-igas' && entry.mode === 'india', {
  path: '/working-with-igas', mode: 'india', title: 'Working with IGAS', description: 'A useful working relationship starts with a shared understanding of the question, the work and the outcome.',
  seo: seo('Working with IGAS', 'Learn what to expect from an initial conversation and how to prepare for working with IGAS.'),
  sections: [
    { __component: 'shared.rich-text', eyebrow: 'Getting started', title: 'Make the first conversation useful.', body: blocks(['Share the context', 'Tell us about your business, the question you are trying to answer and any timing considerations. A short overview is enough to begin.'], ['Agree on the work', 'We can discuss the information available, clarify the scope and identify the next step. The services, responsibilities and commercial terms should be agreed before an engagement begins.'], ['Stay connected', 'Clear communication helps everyone understand progress, outstanding questions and the decisions that need attention.']), theme: 'light' },
    { __component: 'shared.image-text', title: 'A little preparation goes a long way.', eyebrow: 'Before we speak', body: 'Think about the outcome you want, the challenge behind it and the information you already have. Avoid including confidential documents in an initial enquiry unless a suitable sharing arrangement has been agreed.', imageUrl: articleImages[1], imageAlt: 'Illustrative business planning discussion', imageSide: 'right', ctaLabel: 'Browse services', ctaHref: '/services' },
    { __component: 'shared.cta', title: 'Start with your next question.', body: 'Tell us where you need a clearer view.', label: 'Contact IGAS', href: '/contact', theme: 'dark' },
  ],
})

// Legal text is deliberately draft-only until the actual business and provider details are approved.
for (const [title, pagePath, instructions] of [
  ['Privacy Policy', '/privacy-policy', 'Confirm the responsible business entity, contact details, data collected by forms and analytics, delivery providers, retention, individual rights and applicable requirements.'],
  ['Terms of Use', '/terms-of-use', 'Confirm the website owner, permitted use, intellectual property, engagement boundaries, external links and applicable jurisdiction.'],
  ['Disclaimer', '/disclaimer', 'Confirm the approved scope of informational content, professional advice limitations, accuracy statements and responsibility for external links.'],
  ['Cookie Policy', '/cookie-policy', 'Confirm the actual deployed cookies, analytics provider, purpose, duration and preference controls before approving this policy.'],
]) await save('pages', (entry) => entry.path === pagePath && entry.mode === 'india', { title, path: pagePath, mode: 'india', description: 'Editorial draft — requires review before publication.', seo: seo(`${title} | IGAS`, 'Policy draft awaiting approval.', true), sections: [{ __component: 'shared.rich-text', title: `${title} — draft for review`, eyebrow: 'Not approved for publication', theme: 'light', body: [paragraph('This is an editorial placeholder, not an approved policy.'), paragraph(instructions)] }] }, false)

const nav = [
  ['Home', '/', 'who-we-are', 'About IGAS', 'Explore the IGAS homepage.'],
  ['About Us', '/about', 'who-we-are', 'About IGAS', 'Independent thinking and practical support for business decisions.'],
  ['Our approach', '/our-approach', 'who-we-are', 'How we work', 'How we turn context and information into practical next steps.'],
  ['Working with IGAS', '/working-with-igas', 'who-we-are', 'How we work', 'What to expect from an initial conversation.'],
  ['Leadership', '/leadership', 'who-we-are', 'Our people & presence', 'Preview leadership profiles; demo records will be replaced before launch.'],
  ['Our offices', '/offices', 'who-we-are', 'Our people & presence', 'Preview our office layout; location details are illustrative.'],
  ['Services', '/services', 'what-we-do', null, 'Explore accounting, audit, tax, risk and business advisory services.'],
  ['Contact', '/contact', 'contact', null, 'Start a conversation about the decision in front of you.'],
]
for (const [order, [label, href, group, parentGroup, description]] of nav.entries()) await save('navigation-items', (entry) => entry.href === href && entry.mode === 'india' && entry.menuType === 'header', { label, href, group, parentGroup, description, menuType: 'header', visible: true, external: false, cta: href === '/contact', mode: 'india', order })

const footer = published('footers').find((entry) => entry.mode === 'india')
await save('footers', (entry) => entry.mode === 'india', {
  mode: 'india', contactPhone: footer?.contactPhone?.includes('X') ? null : footer?.contactPhone,
  usefulLinks: [['About IGAS', '/about'], ['Our approach', '/our-approach'], ['Services', '/services'], ['Industries', '/industries'], ['Latest thinking', '/latest-thinking'], ['Careers', '/careers'], ['Contact', '/contact']].map(([label, href], order) => ({ label, href, external: false, order })),
  // Do not link to unpublished policy drafts.
  legalLinks: (footer?.legalLinks || []).filter((link) => !['/privacy-policy', '/terms-of-use', '/disclaimer', '/cookie-policy'].includes(link.href)).map(cleanComponent),
})

// Give /global its own copy without claiming a real international office network.
const india = await api('site-settings?filters[mode][$eq]=india&populate=*')
const globalBase = india[0]
const settingsKeys = ['heroEyebrow', 'heroTitle', 'heroIntro', 'heroCta', 'heroCtaHref', 'heroImageUrl', 'statementTitle', 'statementIntro', 'statementCtaLabel', 'statementCtaHref', 'aboutTitle', 'aboutText', 'aboutCtaLabel', 'aboutCtaHref', 'aboutImageUrl', 'presenceTitle', 'presenceText', 'careersTitle', 'careersText', 'careersImageUrl', 'newsletterTitle', 'footerSignature', 'contactEmail', 'contactCtaLabel', 'contactCtaHref', 'searchLabel', 'searchPlaceholder', 'contactEyebrow', 'contactTitle', 'contactIntro', 'contactConsentText', 'contactSuccessMessage', 'cookieTitle', 'cookieDescription', 'cookieAcceptLabel', 'cookieRejectLabel', 'cookieManageLabel', 'cookieEssentialLabel', 'cookieAnalyticsLabel', 'cookieMarketingLabel', 'megaMenus']
await save('site-settings', (entry) => entry.mode === 'global', {
  ...Object.fromEntries(settingsKeys.map((key) => [key, cleanComponent(globalBase[key] ?? null)])), mode: 'global',
  heroEyebrow: 'A wider perspective', heroTitle: 'Look beyond the immediate question.', heroIntro: 'Explore IGAS perspectives on risk, business change and the financial decisions that shape what comes next.',
  statementTitle: 'Context makes a difference.', statementIntro: 'Markets and business models change. A clear view of information, responsibilities and priorities helps leaders ask better questions and plan the next step.', statistics: [],
})
await save('footers', (entry) => entry.mode === 'global', { mode: 'global', quote: 'Independent thinking. Practical perspective.', signature: 'Explore IGAS services, industry perspectives and published insights.', newsletterTitle: 'Keep a wider perspective', newsletterDescription: 'Discover ideas on business, risk and change.', contactEmail: sharedSettings.contactEmail, usefulLinks: [{ label: 'India site', href: '/', external: false, order: 0 }, { label: 'Latest thinking', href: '/latest-thinking', external: false, order: 1 }, { label: 'Contact', href: '/contact', external: false, order: 2 }], legalLinks: [], socialLinks: [], copyright: '© 2026 IGAS. All rights reserved.' })

if (process.env.REVALIDATION_SECRET) {
  const response = await fetch('http://localhost:3000/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` }, signal: AbortSignal.timeout(20000) })
  console.log(`Website cache refresh: HTTP ${response.status}`)
}
console.log(`Completed ${journal.length} content changes. Backups and change journal: ${backupDir}`)
