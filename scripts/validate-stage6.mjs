import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const checks = []
const assert = (condition, message) => { if (!condition) throw new Error(message); checks.push(message) }

assert(fs.existsSync(path.join(root, 'docs/LAUNCH-READINESS.md')), 'launch readiness decision exists')
assert(fs.existsSync(path.join(root, 'docs/FINAL-QA-REPORT.md')), 'final QA report exists')
assert(fs.existsSync(path.join(root, 'docs/STAGE-6-REPORT.md')), 'Stage 6 report exists')
assert(read('docs/LAUNCH-READINESS.md').includes('BLOCKED FROM LAUNCH'), 'launch is not falsely approved')
assert(read('docs/LAUNCH-READINESS.md').includes('Owner'), 'launch blockers have owners')
assert(read('docs/LAUNCH-READINESS.md').includes('Required action'), 'launch blockers have required actions')
assert(read('docs/PRODUCTION-QA-CHECKLIST.md').includes('NOT CONFIGURED'), 'QA uses final acceptance states')
assert(read('docs/CLIENT-HANDOVER.md').includes('Access and ownership'), 'handover defines access/ownership boundaries')
assert(read('docs/STAGE-6-REPORT.md').includes('environment-only'), 'runner build limitation is documented')

console.log(`Stage 6 contract validation passed (${checks.length} checks).`)
