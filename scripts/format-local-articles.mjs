import fs from 'node:fs/promises'
import assert from 'node:assert/strict'

const base = process.env.CMS_EDIT_URL
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local CMS only.')
const headers = { Authorization: `Bearer ${process.env.CMS_EDIT_API_TOKEN}`, 'content-type': 'application/json' }
async function api(endpoint, method = 'GET', data) {
  const response = await fetch(`${base}/api/${endpoint}`, { method, headers, body: data ? JSON.stringify({ data }) : undefined, signal: AbortSignal.timeout(20000) })
  const body = await response.json()
  if (!response.ok) throw new Error(`CMS ${response.status}: ${body.error?.message || 'request failed'}`)
  return body.data
}
const published = await api('articles?populate=*&pagination[pageSize]=100')
const draft = await api('articles?status=draft&populate=*&pagination[pageSize]=100')
const backup = `cms/.tmp/article-format-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
await fs.writeFile(backup, JSON.stringify({ published, draft }, null, 2), { mode: 0o600 })
const outlines = [
  ['rethinking-risk-connected-world', ['A Changing Risk Landscape', 'Looking Beyond Traditional Risk', 'Understanding Emerging Risks', 'Strengthening Governance', 'Connecting Risk With Strategy', 'Building a More Resilient Future'], ['Cybersecurity', 'Data management', 'Operational resilience', 'Regulatory change', 'Third-party dependencies', 'Technology adoption', 'Financial exposure']],
  ['building-resilient-organizations', ['Understanding Organizational Resilience', 'Understanding Dependencies', 'Building Flexible Capabilities', 'The Role of Leadership', 'From Response to Preparedness', 'Building for the Future'], ['People', 'Technology', 'Suppliers', 'Financial resources', 'Data', 'Infrastructure', 'Critical processes']],
  ['technology-catalyst-for-change', ['Technology and Business Transformation', 'Starting With the Business Need', 'Improving Operational Efficiency', 'Data and Decision-Making', 'Managing Technology Change', 'Creating Sustainable Change'], ['Skills and capabilities', 'Change management', 'Cybersecurity', 'Data governance', 'Technology integration', 'Operating processes', 'Risk management']],
  ['navigating-growth-changing-economy', ['Growth in a Changing Environment', 'Creating Strategic Clarity', 'Strengthening the Operating Foundation', 'Balancing Opportunity and Risk', 'Turning Strategy Into Action', 'Looking Forward'], ['Market conditions', 'Capital requirements', 'Operational capacity', 'Regulatory considerations', 'Technology requirements', 'Talent needs', 'Risk exposure']],
  ['future-of-business-transformation', ['The Changing Business Environment', 'Building for Long-Term Growth', 'Technology as an Enabler', 'What Organizations Should Consider', 'Looking Ahead'], ['Strategic priorities', 'Operating model design', 'Technology capabilities', 'Data and information', 'Risk management', 'Organizational capabilities', 'Customer experience', 'Change management']],
]
const text = (node) => node.text ?? (node.children || []).map(text).join('')
const leaves = (nodes) => nodes.flatMap((node) => typeof node.text === 'string' ? (node.text.trim() ? [node.text] : []) : leaves(node.children || []))
for (const [index, [slug, headings, listItems]] of outlines.entries()) {
  const article = published.find((entry) => entry.slug === slug)
  if (!article) continue
  const content = []
  for (const block of article.content || []) {
    const value = text(block).trim()
    if (block.type === 'paragraph' && !value) continue
    if (headings.includes(value) && ['paragraph', 'heading'].includes(block.type)) content.push({ ...block, type: 'heading', level: 2 })
    else if (block.type === 'paragraph' && listItems.includes(value)) {
      if (content.at(-1)?.type !== 'list') content.push({ type: 'list', format: 'unordered', children: [] })
      content.at(-1).children.push({ type: 'list-item', children: block.children })
    } else if (value === 'This can include:') content.push({ type: 'paragraph', children: block.children })
    else content.push(block)
  }
  assert.deepEqual(leaves(content), leaves(article.content || []), `Text changed for ${slug}`)
  await api(`articles/${article.documentId}?status=published`, 'PUT', { content, sortOrder: index + 1 })
  console.log(`Formatted ${slug}: order ${index + 1}, all text preserved`)
}
if (process.env.REVALIDATION_SECRET) {
  const response = await fetch('http://localhost:3000/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` }, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`Website refresh failed: ${response.status}`)
}
console.log(`Original CMS content saved to ${backup}`)
