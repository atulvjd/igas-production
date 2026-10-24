import assert from 'node:assert/strict'

const cms = process.env.STRAPI_URL
if (!cms || !['localhost', '127.0.0.1'].includes(new URL(cms).hostname)) throw new Error('This smoke check expects the local CMS.')
const response = await fetch(`${cms}/api/articles?sort[0]=sortOrder:asc&pagination[pageSize]=100`, { headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }, signal: AbortSignal.timeout(15000) })
assert.equal(response.status, 200)
const { data: articles } = await response.json()
assert.ok(articles.length)
const plain = (html) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const leaves = (nodes) => nodes.flatMap((node) => typeof node.text === 'string' ? (node.text.trim() ? [node.text] : []) : leaves(node.children || []))
const getPage = async (route) => {
  const result = await fetch(`http://localhost:3000${route}`, { signal: AbortSignal.timeout(30000) })
  assert.equal(result.status, 200, route)
  return result.text()
}
for (const article of articles) {
  const html = await getPage(`/latest-thinking/${article.slug}`)
  const body = html.split('<article class="article-reading-body">')[1]?.split('</article>')[0]
  assert.ok(body, `Missing body for ${article.slug}`)
  const rendered = plain(body)
  let cursor = 0
  for (const text of leaves(article.content || [])) {
    const position = rendered.indexOf(text, cursor)
    assert.ok(position >= cursor, `Missing or reordered text in ${article.slug}: ${text.slice(0, 70)}`)
    cursor = position + text.length
  }
  assert.match(body, /<ul>/, `Missing bullet list in ${article.slug}`)
  for (const [index, block] of (article.content || []).entries()) {
    if (block.type !== 'heading') continue
    assert.ok(html.includes(`href="#section-${index}"`), `Missing section link in ${article.slug}`)
    assert.ok(body.includes(`id="section-${index}"`), `Missing section target in ${article.slug}`)
  }
  console.log(`PASS: ${article.title} — every text fragment rendered in CMS order, with lists and section links`)
}
for (const [route, marker] of [['/', 'insights-carousel-track'], ['/latest-thinking', 'article-editorial-grid']]) {
  const html = await getPage(route)
  const section = html.slice(html.indexOf(`class="${marker}"`))
  assert.ok(section.length && html.includes(marker))
  let cursor = 0
  for (const article of articles) {
    const position = plain(section).indexOf(article.title, cursor)
    assert.ok(position >= cursor, `Article order mismatch on ${route}`)
    cursor = position + article.title.length
  }
  console.log(`PASS: ${route} follows the same CMS article sequence`)
}
for (const route of ['/articles/rethinking-risk-connected-world', '/our-approach', '/services/tax-regulatory', '/careers/demo-business-advisory-associate']) await getPage(route)
console.log('PASS: article alias and shared rich-text routes still resolve')
