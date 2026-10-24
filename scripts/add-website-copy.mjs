import fs from 'node:fs/promises'

// Run with node --env-file=.env.local --env-file=.env.cms-edit.local scripts/add-website-copy.mjs
const base = process.env.CMS_EDIT_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local CMS only.')
if (!process.env.CMS_EDIT_API_TOKEN) throw new Error('CMS_EDIT_API_TOKEN is required.')
const headers = { Authorization: `Bearer ${process.env.CMS_EDIT_API_TOKEN}`, 'Content-Type': 'application/json' }
async function request(endpoint, method = 'GET', data) {
  const response = await fetch(`${base}/api/${endpoint}`, { method, headers, body: data ? JSON.stringify({ data }) : undefined, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${method} ${endpoint}: HTTP ${response.status}`)
  return (await response.json()).data
}
const records = await request('site-settings?status=published&populate=*')
const backup = `cms/.tmp/website-copy-${new Date().toISOString().replace(/[:.]/g, '-')}`
await fs.mkdir(backup, { recursive: true, mode: 0o700 })
await fs.writeFile(`${backup}/before.json`, JSON.stringify(records, null, 2), { mode: 0o600 })
const common = {
  heroEyebrow: 'Business advisory, audit & tax',
  heroTitle: 'Clarity for your next business decision.',
  heroIntro: 'From financial reporting and tax to risk and business change, IGAS helps you understand the detail, set priorities and move forward with a practical plan.',
  heroCta: 'Explore our services', heroCtaHref: '/services',
  statementTitle: 'A clear view. A practical way forward.',
  statementIntro: 'Sound decisions start with reliable information. We connect financial insight with your business priorities to help you strengthen processes, understand responsibilities and prepare for what comes next.',
  statementCtaLabel: 'How we work', statementCtaHref: '/our-approach',
  aboutTitle: 'Advice grounded in your business.',
  aboutText: 'Every organisation faces a different mix of opportunities and responsibilities. IGAS brings together advisory, audit, tax, risk and transformation services around the questions that matter to your business. We start by understanding your goals, agree a clear scope and focus on practical next steps.',
  aboutCtaLabel: 'Get to know IGAS', aboutCtaHref: '/about',
  presenceTitle: 'Start with a conversation.',
  presenceText: 'Tell us what your business is working towards and where you need support. Explore our contact options to begin a discussion about your priorities.',
  careersTitle: 'Bring curiosity to meaningful work.',
  careersText: 'Interested in financial reporting, business advice or solving operational challenges? Explore careers at IGAS and discover where your skills could contribute.',
  contactEyebrow: 'Let’s talk', contactTitle: 'What is next for your business?',
  contactIntro: 'Share a little about your organisation, the challenge you are facing and the support you are looking for. This helps us understand your enquiry and discuss suitable next steps.',
  contactCtaLabel: 'Contact us', contactCtaHref: '/contact',
  searchLabel: 'Search IGAS', searchPlaceholder: 'Search services, industries and insights',
  newsletterTitle: 'Ideas for the decisions ahead',
  footerSignature: 'Clear thinking. Practical business advice.',
}
for (const record of records) {
  const copy = record.mode === 'global' ? {
    ...common,
    heroEyebrow: 'A wider business perspective',
    heroTitle: 'See the context. Plan the next step.',
    heroIntro: 'Explore IGAS services and perspectives on financial reporting, risk and business change. Connect the questions in front of you with a clearer view of what comes next.',
  } : common
  // Fill gaps while retaining copy already written in the CMS.
  const data = Object.fromEntries(Object.entries(copy).filter(([key]) => !record[key]?.trim()))
  if (!Object.keys(data).length) continue
  await request(`site-settings/${record.documentId}?status=published`, 'PUT', data)
  const updated = (await request(`site-settings?filters[mode][$eq]=${record.mode}&status=published`))[0]
  for (const [key, value] of Object.entries(data)) {
    if (updated?.[key] !== value) throw new Error(`Content verification failed: ${record.mode}.${key}`)
  }
  console.log(`Published and verified ${Object.keys(data).length} content fields for ${record.mode}.`)
}
if (process.env.REVALIDATION_SECRET) {
  try {
    const response = await fetch('http://localhost:3000/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` }, signal: AbortSignal.timeout(10000) })
    console.log(`Website cache refresh: HTTP ${response.status}`)
  } catch { console.log('Website is not running; content will load on its next start.') }
}
console.log(`Local content backup: ${backup}/before.json`)
