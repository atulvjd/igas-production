import assert from 'node:assert/strict'

// Integration regression: a rejected footer populate query used to silently hide CMS links.
// node --env-file=.env.local scripts/check-live-footer.mjs
const cms = process.env.STRAPI_URL
if (!cms || !['localhost', '127.0.0.1'].includes(new URL(cms).hostname)) throw new Error('Local CMS only.')
const headers = { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }
const encode = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;')
for (const [mode, paths] of [['india', ['/', '/contact', '/our-approach']], ['global', ['/global']]]) {
  // A simple reference query independently obtains the actual published CMS content.
  const response = await fetch(`${cms}/api/footers?status=published&filters[mode][$eq]=${mode}&populate=*`, { headers })
  assert.equal(response.status, 200)
  const { data: [footer] } = await response.json()
  assert.ok(footer?.signature, `Missing ${mode} CMS footer`)
  for (const path of paths) {
    const page = await fetch(`http://localhost:3000${path}`, { signal: AbortSignal.timeout(30000) })
    assert.equal(page.status, 200)
    const html = (await page.text()).split('<footer class="footer">')[1]?.split('</footer>')[0]
    assert.ok(html, `Missing footer: ${path}`)
    assert.ok(html.includes(encode(footer.signature)), `CMS signature is missing: ${path}`)
    for (const link of [...footer.usefulLinks, ...footer.legalLinks]) {
      assert.ok(html.includes(`href="${encode(link.href)}"`), `CMS link ${link.href} is missing: ${path}`)
    }
    console.log(`Verified published CMS footer and links: ${path}`)
  }
}
