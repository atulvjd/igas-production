import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)
const modules = new Map()
function load(file) {
  if (modules.has(file)) return modules.get(file)
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(output, { module, exports: module.exports, URL, require: (name) => name === '@/lib/article-content' ? load('lib/article-content.ts') : require(name) }, { filename: file })
  modules.set(file, module.exports)
  return module.exports
}
const { blockText, articleHeadings, readingMinutes, sortArticles, safeContentUrl } = load('lib/article-content.ts')
const { RichText } = load('components/rich-text.tsx')
const text = (value, marks = {}) => ({ type: 'text', text: value, ...marks })
const content = [
  { type: 'heading', level: 4, children: [text('A detailed section')] },
  { type: 'paragraph', children: [text('Start '), { type: 'link', url: '/contact', children: [text('in the middle', { bold: true })] }, text(' finish.', { italic: true })] },
  { type: 'list', format: 'ordered', children: [{ type: 'list-item', children: [text('First item'), { type: 'list', format: 'unordered', children: [{ type: 'list-item', children: [text('Nested detail')] }] }] }, { type: 'list-item', children: [text('Second item')] }] },
  { type: 'quote', children: [text('A quotation')] },
  { type: 'code', children: [text('const value = 1;\nnext();')] },
  { type: 'image', image: { url: 'https://example.com/image.jpg', alternativeText: 'Inline image', caption: 'A caption' } },
  { type: 'paragraph', children: [{ type: 'link', url: 'javascript:alert(1)', children: [text('Keep this text')] }, text(' <script>escaped</script>')] },
  { type: 'custom-block', children: [text('Unknown block content survives')] },
  { type: 'paragraph', children: [text('')] },
]
const html = renderToStaticMarkup(React.createElement(RichText, { content }))
assert.match(html, /<h4 id="section-0">A detailed section<\/h4>/)
assert.match(html, /Start <a href="\/contact"><strong>in the middle<\/strong><\/a><em> finish\.<\/em>/)
assert.match(html, /<ol><li>First item<ul><li>Nested detail<\/li><\/ul><\/li><li>Second item<\/li><\/ol>/)
assert.match(html, /<blockquote>A quotation<\/blockquote>/)
assert.match(html, /<pre><code>const value = 1;\nnext\(\);<\/code><\/pre>/)
assert.match(html, /<figcaption>A caption<\/figcaption>/)
assert.match(html, /alt="Inline image"/)
assert.match(html, /Keep this text/)
assert.match(html, /Unknown block content survives/)
assert.doesNotMatch(html, /javascript:|<script>|<p><\/p>/)
assert.ok(html.indexOf('Nested detail') < html.indexOf('Second item'))
assert.equal(blockText(content[1]), 'Start in the middle finish.')
assert.equal(articleHeadings(content)[0].id, 'section-0')
assert.equal(readingMinutes([{ type: 'paragraph', children: [text('word '.repeat(401))] }]), 3)
const entries = [
  { slug: 'later', sortOrder: 2, publicationDate: '2026-12-01' },
  { slug: 'z', sortOrder: 1, publicationDate: '2026-10-01' },
  { slug: 'a', sortOrder: 1, publicationDate: '2026-10-01' },
  { slug: 'newest', sortOrder: 1, publicationDate: '2026-10-02' },
]
assert.equal(sortArticles(entries).map((item) => item.slug).join(','), 'newest,a,z,later')
assert.equal(entries[0].slug, 'later')
for (const value of ['javascript:alert(1)', '//evil.example', 'data:text/html,test', 'java\nscript:test', '/\\evil']) assert.equal(safeContentUrl(value), undefined)
assert.equal(safeContentUrl('mailto:info@example.com'), 'mailto:info@example.com')
assert.equal(safeContentUrl('mailto:info@example.com', true), undefined)
assert.equal(safeContentUrl('/uploads/example.jpg', true), '/uploads/example.jpg')
console.log('Article checks passed: nested text, lists, marks, headings, images, captions, code, safe links, section IDs, reading time and stable editorial order.')
