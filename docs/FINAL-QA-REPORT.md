# Final QA Report

## Scope and evidence

This is a codebase and local-production-build acceptance report, not a production launch certification. The build used reserved `.invalid` origins and no live Strapi instance; it does not prove approved domains, real CMS content, provider delivery, or production infrastructure. The full collection/field-to-UI mapping is in [`CMS-INTEGRATION-STATUS.md`](./CMS-INTEGRATION-STATUS.md), the launch gate is in [`LAUNCH-READINESS.md`](./LAUNCH-READINESS.md), and the route-by-route deployment checklist is in [`PRODUCTION-QA-CHECKLIST.md`](./PRODUCTION-QA-CHECKLIST.md).

## Final status matrix

| Area | Status | Evidence / blocker |
|---|---|---|
| Application contract suites | PASS | `test:stage2` (48), `test:stage3` (17), `test:stage4` (15), `test:stage5` (12), and `test:stage6` (9). |
| Readiness regression suite | PASS | `test:readiness` (19 checks). |
| TypeScript and whitespace checks | PASS | `pnpm exec tsc --noEmit` and `git diff --check`. |
| Next.js production build | PASS | `next build --webpack` passed using reserved `.invalid` origins. Strapi was unavailable; CMS fetch warnings were expected and build-time CMS collections were empty. |
| Strapi production build | PASS | `pnpm --dir cms run build`. No production CMS/database was configured or deployed. |
| Default Turbopack build | BLOCKED IN RUNNER | Runner OS permission prevents the helper process from binding a port; the Webpack production build is the verified alternative. |
| Local route and sitemap smoke tests | PASS | The root, `/global`, key listing/detail routes, `/robots.txt`, and `/sitemap.xml` returned 200. All 18 sitemap URLs resolved locally; no duplicate URLs or removed/alias paths appeared in the sitemap. Unknown and nested office detail paths returned 404. |
| Canonical URL smoke tests | PASS | `/global` canonicalized to the Global test origin; `/articles` canonicalized to `/latest-thinking`. Test origins are not approved production domains. |
| Contact/newsletter request handling | PASS LOCALLY | Missing contact consent and malformed newsletter JSON returned 400; oversized contact returned 413; development-mode submissions returned 200. With provider endpoints unset in production mode, both APIs returned 503 without returning submitted data. |
| Rate limiting and revalidation authorization | PASS LOCALLY | Contact/newsletter limits returned 429 at their configured thresholds; unauthenticated revalidation returned 401. This does not verify a deployed edge/WAF or real webhook secret. |
| Cookie preference interaction | PASS LOCALLY | Browser UI opened preferences and saved an essential-only choice. The browser had a pre-existing analytics opt-in; after opting out the cookie was `igas-consent=essential`. Local Vercel Analytics script hosting is not available outside Vercel, so no provider analytics acceptance is claimed. |
| Contact / newsletter provider delivery | NOT CONFIGURED | No approved credentials or endpoint exists; no external submission was made. |
| Attachment storage/scanning/retention | NOT CONFIGURED | No approved private provider, malware scanning, or retention policy exists. |
| Production domains and canonical QA | NOT CONFIGURED | No approved India/Global domains or DNS/deployment targets exist. |
| Production Strapi/database/media/backups | NOT CONFIGURED | No production CMS, database, media storage, or verified backup access exists. |
| CMS editor, publishing, and webhook acceptance | BLOCKED | Requires a write-enabled test CMS and authorized webhook configuration. |
| Deployed browser/device, accessibility, and performance QA | BLOCKED | Local consent interaction is not a substitute for the agreed deployed-device, assistive-technology, or performance checks. |
| SEO/indexing acceptance | BLOCKED | Route and canonical logic were smoke-tested with test origins; final approved origin/content verification is pending. |
| Security/WAF/backup acceptance | BLOCKED | Application safeguards were exercised locally; deployment controls and verified backups remain pending. |

## Route and integration summary

| Website surface | What is linked | Current qualification |
|---|---|---|
| Home, About, Contact, Careers, Services, Industries, Latest Thinking, Offices, and Leadership | Built-in Next.js route/layouts read published Strapi content through the server-side adapters; menus, footer, and site settings are shared site chrome. | Local routes resolve. Content completeness depends on the unavailable live CMS. |
| Service and Industry detail pages | Published records drive detail copy, media, metadata, and related-content links. | The historical read-only CMS snapshot contained five records of each type, but those records had empty descriptions; do not treat route success as content acceptance. |
| Article listing/detail pages | Published Article fields populate cards, carousel, detail content, related links, metadata, and optional author byline. | `/articles` remains an alias; `/latest-thinking` is canonical. Historical snapshot contained five Articles. |
| Jobs, Offices, Leadership, navigation, footer, Site settings, and Page Builder | Strapi collection/component mappings are documented in [`CMS-INTEGRATION-STATUS.md`](./CMS-INTEGRATION-STATUS.md). | These collections were empty in the historical CMS snapshot; no live publish, custom CMS route, or editor workflow was verified. |
| Contact and newsletter forms | Browser forms use same-origin Next.js APIs with server-side validation, request-size limits, consent enforcement for contact, and configured delivery adapters. | Local validation and safe no-provider failures passed; actual delivery is not configured. |
| Analytics and cookie preferences | Analytics is gated behind opt-in, and the consent cookie is checked before event submission; preferences remain changeable through the site UI. | Local preference persistence was checked. No marketing tracking is connected; legal approval of consent policy/copy is outstanding. |
| Revalidation | Strapi can request path revalidation through `/api/revalidate` using a server-held secret. | Missing authorization was rejected locally; authenticated Strapi publish → webhook → frontend propagation was not tested. |
| Sitemap and robots | Sitemap generation filters to built-in and published CMS paths, drops dead paths and the `/articles` alias, and uses configured origins. | Generated XML and its 18 current URLs were checked locally with empty CMS data; deployed indexing approval remains outstanding. |

## Observed broken, missing, or intentionally unavailable paths

- `/privacy` and `/useful-links` return 404 and are excluded from the sitemap. No hardcoded first-party link to either path was found; the historical CMS snapshot had no published Pages, but current CMS-configured navigation/footer links could not be checked.
- Unknown `/offices/...` records and nested fake detail routes return 404, as intended; a published Office/Leadership/Job record could not be tested because the local CMS was unavailable.
- Production form delivery returns 503 until the approved provider endpoint and mode are configured. This is an explicit safe failure, not successful delivery.
- `/api/revalidate` returns 401 without authorization. Configure the real secret and test the authenticated publish workflow before launch.
- No production domains, Strapi/database, records/media, contact/newsletter providers, private attachment storage, or backup controls are linked/configured in this workspace.
- Historical CMS snapshot evidence reported five Services, five Industries, and five Articles, but no non-empty description/short-description on the Service or Industry records. Those are known content gaps, not route failures. The rest of the relevant collections had zero records in that snapshot. This count is historical, not a fresh live check.
- The default Turbopack build is blocked by the runner's helper-port permission; the Webpack build succeeds. No application-level build failure was observed.

No external provider, CMS publish, deployment, domain, media, backup, or device test is represented as PASS without evidence. Launch remains blocked until all CRITICAL launch items in [`LAUNCH-READINESS.md`](./LAUNCH-READINESS.md) are completed and evidenced.
