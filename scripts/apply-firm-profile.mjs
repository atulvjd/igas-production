import fs from 'node:fs/promises'

// Source: user-supplied “IGAS International - Top firm profile - Bangalore.pdf”,
// pages 4–10, 12, 17–19. Document placeholders and internal SWOT are excluded.
// Run: node --env-file=.env.local --env-file=.env.cms-edit.local scripts/apply-firm-profile.mjs
const base = process.env.CMS_EDIT_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local CMS only.')
if (!process.env.CMS_EDIT_API_TOKEN) throw new Error('CMS_EDIT_API_TOKEN is required.')
const headers = { Authorization: `Bearer ${process.env.CMS_EDIT_API_TOKEN}`, 'Content-Type': 'application/json' }
async function api(endpoint, method = 'GET', data) {
  const response = await fetch(`${base}/api/${endpoint}`, { method, headers, body: data ? JSON.stringify({ data }) : undefined, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${method} ${endpoint}: HTTP ${response.status} ${(await response.json()).error?.message || ''}`)
  return (await response.json()).data
}
const names = ['site-settings', 'services', 'industries', 'offices', 'footers', 'pages', 'navigation-items']
const snapshot = {}
for (const name of names) {
  snapshot[name] = {}
  for (const status of ['draft', 'published']) snapshot[name][status] = await api(`${name}?status=${status}&pagination[pageSize]=100&${name === 'pages' ? 'populate[sections][populate]=*' : 'populate=*'}`)
}
const directory = `cms/.tmp/firm-profile-${new Date().toISOString().replace(/[:.]/g, '-')}`
await fs.mkdir(directory, { recursive: true, mode: 0o700 })
await fs.writeFile(`${directory}/before.json`, JSON.stringify(snapshot, null, 2), { mode: 0o600 })
const clean = value => JSON.parse(JSON.stringify(value, (key, item) => key === 'id' ? undefined : item))
const journal = []
async function save(name, existing, data) {
  const record = await api(`${name}${existing ? `/${existing.documentId}` : ''}?status=published`, existing ? 'PUT' : 'POST', clean(data))
  // Verify the public, published representation, rather than only the write response.
  const verified = await api(`${name}/${record.documentId}?status=published`)
  for (const [key, value] of Object.entries(data)) if (value === null || typeof value !== 'object') {
    if (verified[key] !== value) throw new Error(`Verification failed: ${name}.${key}`)
  }
  journal.push({ collection: name, documentId: record.documentId, fields: Object.keys(data) })
  await fs.writeFile(`${directory}/changes.json`, JSON.stringify(journal, null, 2), { mode: 0o600 })
  console.log(`Published and verified: ${name} / ${data.title || data.name || existing?.mode || existing?.title || record.documentId}`)
  return record
}
const paragraph = text => ({ type: 'paragraph', children: [{ type: 'text', text }] })
const blocks = (...sections) => sections.flatMap(([title, text]) => [{ type: 'heading', level: 2, children: [{ type: 'text', text: title }] }, paragraph(text)])
const seo = (title, description) => ({ metaTitle: title.slice(0, 60), metaDescription: description.slice(0, 160), noIndex: false })
const statistics = [
  ['31', 'Office locations', 'Across India, as stated in the firm profile.'],
  ['19', 'Cities', 'An Indian presence serving a broad range of businesses.'],
  ['400+', 'Employees', 'Team size stated in the firm profile.'],
  ['38', 'Founding partners', 'Professional experience supported by active senior-partner involvement.'],
  ['40+', 'Years of team experience', 'Experience of the team and partners; not the age of the IGAS firm.'],
].map(([value, label, detail], sortOrder) => ({ value, label, detail, sortOrder, active: true }))
for (const settings of snapshot['site-settings'].published) {
  const menuCopy = {
    'what-we-do': ['Expertise around your business.', 'Audit and assurance, tax, consulting, deals, forensic and strategy services, with practical guidance tailored to each situation.'],
    'where-we-focus': ['Industry context. Practical solutions.', 'Experience across manufacturing, financial services, technology, entertainment, healthcare and pharma, alongside a wider range of sectors.'],
    'who-we-are': ['Pride in service. Confidence in delivery.', 'A homegrown Indian accounting and consulting firm guided by care, integrity, commitment, consistency and empathy.'],
    careers: ['Grow with purpose.', 'An environment that encourages personal growth, mentoring, integrity and ideas that go beyond a checklist.'],
  }
  await save('site-settings', settings, {
    heroEyebrow: settings.mode === 'global' ? 'Homegrown in India. A wider perspective.' : 'IGAS · Pride in service',
    heroTitle: 'Pride in service. Confidence in delivery.',
    heroIntro: 'A homegrown Indian accounting and consulting firm bringing together audit, tax, consulting, deals, forensic and strategy expertise. Practical guidance, active partner involvement and care for the people behind every business.',
    statementTitle: 'An Indian foundation. Experience that goes deeper.',
    statementIntro: 'The supplied IGAS firm profile describes 31 office locations in 19 cities, 38 founding partners and more than 400 employees. Its team and partners bring over four decades of experience to practical, implementable and sustainable business solutions.',
    statistics,
    aboutTitle: 'Driven by purpose. Grounded in care.',
    aboutText: 'IGAS exists to serve society with attention and care. We combine industry understanding and professional experience with the responsiveness of a focused consulting team. Our purpose shapes how we work: understand your challenge, involve senior partners and develop practical solutions that add value. Care, integrity, commitment, consistency and empathy guide our relationships.',
    presenceTitle: 'Close to business. Connected across India.',
    presenceText: 'Our firm profile describes a presence across 19 Indian cities, with a corporate office in Mumbai and a branch in Bengaluru. We serve startups, privately owned businesses, large and regulated organisations, public entities and businesses with international operations.',
    careersTitle: 'Grow with integrity. Contribute with purpose.',
    careersText: 'IGAS’s mission is to create an environment for personal growth, healthy competition, contentment and integrity. We value mentoring, collaborative thinking and a diverse, inclusive workplace where people can develop their skills and contribute ideas.',
    contactTitle: 'Let’s understand your business challenge.',
    contactIntro: 'Connect with our Mumbai corporate office or Bengaluru branch to discuss audit, tax, consulting, deals, forensic or strategy support. Tell us about your organisation and the outcome you are working towards.',
    contactEmail: 'Mohan@caigas.in', footerSignature: 'Pride in service. Confidence in delivery.',
    megaMenus: settings.megaMenus.map(menu => menuCopy[menu.section] ? { ...menu, title: menuCopy[menu.section][0], description: menuCopy[menu.section][1] } : menu),
    seo: seo('IGAS | Audit, Tax & Business Consulting', 'Homegrown Indian accounting and consulting firm. Explore IGAS audit, tax, consulting, deals, forensic and strategy services.'),
  })
}
const additionalServices = [
  ['Deals', 'deals', 'Perspective for important transaction decisions.', 'IGAS’s service portfolio includes deals support, connecting business context and financial information with important transaction decisions.', 'Discuss your transaction priorities', 'Whether you are considering an opportunity or assessing the next stage of a business, begin with the commercial question, the information available and your decision timeline. The scope of support is agreed around your situation.'],
  ['Forensic', 'forensic', 'A focused perspective on complex business concerns.', 'Forensic services form part of IGAS’s multidisciplinary offering, combining professional experience, industry context and attention to the detail behind a business concern.', 'Start with a clear understanding', 'Share the nature of the concern and the questions that need to be addressed. An initial discussion helps establish the appropriate scope, information requirements and next steps.'],
  ['Strategy', 'strategy', 'Pragmatic guidance shaped around your goals.', 'IGAS brings a collaborative, practical approach to strategy, helping stakeholders consider their challenges and work towards implementable and sustainable solutions.', 'Connect ambition with practical action', 'Our approach starts with understanding your business and desired outcome. Industry knowledge, senior-partner involvement and a focus on value help keep the discussion connected to business operations.'],
]
for (const [index, [title, slug, shortDescription, description, heading, body]] of additionalServices.entries()) {
  await save('services', snapshot.services.draft.find(item => item.slug === slug), { title, slug, shortDescription, description, tag: title, fullContent: blocks([heading, body], ['Partner-led and practical', 'IGAS emphasises active senior-partner involvement, collaborative working and practical guidance customised to each engagement.']), mode: 'india', sortOrder: 5 + index, seo: seo(`${title} | IGAS`, description) })
}
for (const service of snapshot.services.published) {
  // Existing detailed service descriptions are retained.
  const heading = 'The IGAS approach'
  if (!JSON.stringify(service.fullContent).includes(heading)) await save('services', service, { fullContent: [...(service.fullContent || []), ...blocks([heading, 'Our firm profile emphasises active senior-partner involvement, industry and solutions specialisation, and investment in tools, technology and knowledge. We focus on understanding your challenge and working with you towards practical, implementable and sustainable solutions.'])] })
}
const industryNotes = {
  'financial-services': ['Financial Services', 'IGAS’s firm profile includes financial services among the industries served by the firm and its team. We bring a practical, industry-informed approach to financial reporting, tax and business challenges.'],
  'entertainment-media': ['Entertainment & Media', 'Entertainment is among the industries served by IGAS and its team. Our approach connects the commercial context of creative businesses with practical professional guidance.'],
  healthcare: ['Healthcare & Pharma', 'The firm profile identifies healthcare and pharma as an area of industry experience. IGAS combines sector understanding with audit, tax and consulting perspectives tailored to the organisation.'],
  manufacturing: ['Manufacturing', 'Manufacturing is one of the industries served by IGAS and its team. Industry context helps shape practical advice around financial information, processes and business priorities.'],
  technology: ['Technology', 'The firm profile includes information technology among the industries served by IGAS and its team. We combine professional experience with an interest in tools, technology and knowledge that support quality service.'],
}
for (const industry of snapshot.industries.published) {
  const note = industryNotes[industry.slug]
  if (!note) continue
  const heading = 'Industry experience at IGAS'
  await save('industries', industry, { title: note[0], ...(!JSON.stringify(industry.fullContent).includes(heading) ? { fullContent: [...(industry.fullContent || []), ...blocks([heading, note[1]])] } : {}) })
}
const offices = [
  ['Mumbai corporate office', 'mumbai', 'Mumbai', 'Floor-1, 16/30, Bahadoor building, Homji street, RBI Horniman circle, Fort, Mumbai - 400001'],
  ['Bengaluru branch office', 'bengaluru', 'Bengaluru', 'Floor-1, Office No.2, Gopal Reddy Complex, Panathur Main Rd, Munireddy Layout, Kaverappa Layout, Kadubeesanahalli, Panathur, Bengaluru, Karnataka - 560103'],
]
for (const [sortOrder, [name, slug, city, address]] of offices.entries()) {
  const existing = snapshot.offices.draft.find(item => item.slug === slug) || (sortOrder === 0 ? snapshot.offices.draft.find(item => item.slug.startsWith('demo-')) : undefined)
  await save('offices', existing, { name, slug, city, country: 'India', address, email: 'Mohan@caigas.in', description: [paragraph(`${name}, as listed in the IGAS firm profile. Contact the team to discuss your business and professional service requirements.`)], mode: 'india', sortOrder, imageUrl: null, imageAlt: null, seo: seo(`${name} | IGAS`, `Contact IGAS in ${city} for audit, tax, consulting and business service enquiries.`) })
}
for (const footer of snapshot.footers.published) await save('footers', footer, { quote: 'Pride in Service. Confidence in Delivery.', quoteAuthor: 'IGAS', signature: 'A homegrown Indian accounting and consulting firm, driven by a purpose to serve society with attention and care.', contactEmail: 'Mohan@caigas.in' })
for (const page of snapshot.pages.published) {
  const sections = clean(page.sections).map(({ __component, ...fields }) => ({ __component, ...Object.fromEntries(Object.entries(fields).filter(([key, value]) => value !== null || !['image'].includes(key))) }))
  for (const section of sections) if (section.__component === 'shared.contact-form') section.contactEmail = 'Mohan@caigas.in'
  if (page.path === '/our-approach') {
    const rich = sections.find(section => section.__component === 'shared.rich-text')
    rich.title = 'Understand the challenge. Partner on the solution.'
    rich.body = blocks(
      ['Our purpose', 'To serve society with utmost attention and care. We focus on understanding each client’s challenge and delivering timely support, quality and value.'],
      ['Our mission', 'To create an environment that encourages personal growth, healthy competition, contentment and integrity, while mentoring our clients towards their desired outcomes.'],
      ['Our vision', 'To be an admired and preferred organisation in the accounting and consultancy industry.'],
      ['Our values', 'Care, integrity, commitment, consistency and empathy guide how we work with clients, colleagues and communities.'],
      ['Practical, partner-led delivery', 'Active senior-partner involvement, industry specialisation and investment in tools and knowledge support pragmatic guidance tailored to each situation. We work collaboratively towards implementable and sustainable solutions.'],
      ['Responsibility to society', 'The firm profile describes commitments to community engagement, environmental responsibility, diversity and inclusion, education and skills, and health initiatives.'],
    )
    const stats = sections.find(section => section.__component === 'shared.stats')
    stats.title = 'The IGAS footprint'
    stats.intro = 'Figures stated in the supplied firm profile. Experience refers to the team and partners.'
    stats.items = statistics
    const quote = sections.find(section => section.__component === 'shared.quote')
    quote.quote = 'Serve the society with utmost attention and care'
    quote.signature = 'The IGAS purpose'
  }
  await save('pages', page, { sections })
}
for (const item of snapshot['navigation-items'].published) {
  if (item.href === '/offices') await save('navigation-items', item, { description: 'Find our Mumbai corporate office and Bengaluru branch.' })
}
if (process.env.REVALIDATION_SECRET) {
  const response = await fetch('http://localhost:3000/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` }, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`Website cache refresh: HTTP ${response.status}`)
  console.log('Website cache refreshed.')
}
console.log(`Completed ${journal.length} verified local CMS updates. Backup: ${directory}/before.json`)
