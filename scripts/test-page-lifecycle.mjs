import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = fs.readFileSync('cms/src/api/page/content-types/page/lifecycles.ts', 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
class ApplicationError extends Error {}
let rows = []
const module = { exports: {} }
vm.runInNewContext(compiled, {
  module, exports: module.exports,
  require: () => ({ errors: { ApplicationError } }),
  strapi: { db: { query: () => ({ findOne: async ({ where }) => rows.find((row) => Object.entries(where).every(([key, value]) => typeof value === 'object' && value !== null ? row[key] !== value.$ne : row[key] === value)) || null }) } },
})
const lifecycle = module.exports.default
const draft = { id: 1, documentId: 'first', path: '/example', mode: 'india' }
rows = [draft]
await lifecycle.beforeCreate({ params: { data: { documentId: 'first', path: '/example', mode: 'india' } } })
await assert.rejects(lifecycle.beforeCreate({ params: { data: { documentId: 'other', path: '/example', mode: 'india' } } }), ApplicationError)
await lifecycle.beforeCreate({ params: { data: { documentId: 'other', path: '/example', mode: 'global' } } })
await lifecycle.beforeUpdate({ params: { data: { title: 'Updated title' }, where: { id: 1 } } })
rows.push({ id: 2, documentId: 'first', path: '/example', mode: 'india' })
await lifecycle.beforeUpdate({ params: { data: { path: '/example', mode: 'india' }, where: { id: 1 } } })
rows.push({ id: 3, documentId: 'second', path: '/taken', mode: 'india' })
await assert.rejects(lifecycle.beforeUpdate({ params: { data: { path: '/taken' }, where: { id: 1 } } }), ApplicationError)
console.log('Page lifecycle checks passed: publish versions, duplicate documents, modes, partial updates, and path collisions.')
