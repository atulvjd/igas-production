# IGAS Stage 3 Report

**Stage:** 3 - Content Ownership and Operational Foundations

**Baseline:** `docs/STAGE-2-REPORT.md`

**Scope:** CMS page migration foundations, unified CMS chrome, operational form endpoints, canonical URLs, sitemap timestamps, mode isolation, security configuration, and validation.

## 1. Summary

Stage 3 moved the project toward content-owned and operationally functional behavior without redesigning the website or replacing the existing fallback architecture.

Implemented:

- Server-side contact submission endpoint
- Contact validation and attachment policy
- Newsletter server endpoint and provider adapter boundary
- CMS Contact Form Dynamic Zone section
- CMS navigation/footer context for legacy fallback routes
- Rich Service and Industry detail rendering through CMS Blocks
- Mode filtering for CMS Services, Industries, and Articles
- Mode-aware canonical origin utility
- Configurable India and Global site origins
- CMS-aware sitemap last-modified timestamps
- Environment-configured Strapi CORS
- Stage 3 contract validation command
- CMS-seeded editable About and Contact demo Pages
- Stage 3 architecture documentation

No visual redesign was performed.

The project still uses static fallback data when CMS content or delivery providers are unavailable.

## 2. CMS Migration Status

| Area | CMS primary path | Fallback | Status |
|---|---|---|---|
| Homepage | Page Dynamic Zone / Site Content | HomePage | Supported |
| Global homepage | Global Page Dynamic Zone / Site Content | Global HomePage | Supported |
| About | CMS Page | AboutPage | Seedable and CMS-renderable |
| Contact content | CMS Page and Contact Form section | ContactPage | CMS content supported; delivery endpoint connected |
| Services listing | Services collection/Page | Static services | CMS-backed |
| Service detail | Service collection | Static service | Rich Blocks now rendered |
| Industries listing | Industries collection/Page | Static industries | CMS-backed |
| Industry detail | Industry collection | Static industry | Rich Blocks now rendered |
| Latest Thinking | Articles collection/Page | Static articles | CMS-backed |
| Article detail | Article content blocks | Static articles | CMS-backed |
| Careers | Jobs collection/Page | Static jobs | CMS-backed |
| Job detail | Job collection | Static jobs | CMS-backed |
| Offices | Office collection/Page | Static offices | CMS-backed |
| Office detail | Office collection | Static offices | CMS-backed |
| Leadership | Leadership Profile collection/Page | Static detail page | CMS-backed when records exist |
| Navigation | Navigation Items | Static navigation | Shared chrome pipeline |
| Footer | Footer collection | Static footer | Shared chrome pipeline |

The seed creates clearly marked demo About and Contact Pages using existing copy. It does not fabricate client data.

## 3. Contact Submission

The contact flow is now:

```text
Contact Form
  -> POST /api/contact
  -> FormData validation
  -> attachment policy
  -> configured CONTACT_WEBHOOK_URL
  -> safe JSON response
```

The endpoint is implemented in `app/api/contact/route.ts`.

The validation and delivery boundary is in `lib/contact.ts`.

Validated fields:

- Name
- Work email
- Message
- Consent
- Optional attachment

Attachment policy:

- Maximum size: 5 MB
- Accepted types: PDF, DOC, DOCX
- Filename characters are sanitized
- MIME type is checked
- Only attachment metadata is sent through the generic webhook adapter
- File bytes are not silently stored or forwarded without an approved provider

Development behavior:

```text
CONTACT_DELIVERY_MODE=development
```

Production behavior requires:

```text
CONTACT_WEBHOOK_URL=<server-only provider endpoint>
```

If production delivery is not configured, the endpoint returns a safe 503 instead of pretending the enquiry was delivered.

No sensitive form contents are logged. Development logging includes only limited metadata.

## 4. Newsletter

The newsletter flow is now:

```text
Newsletter Form
  -> POST /api/newsletter
  -> email validation
  -> configured NEWSLETTER_WEBHOOK_URL
  -> safe JSON response
```

The endpoint is implemented in `app/api/newsletter/route.ts`.

The adapter is implemented in `lib/newsletter.ts`.

Development behavior:

```text
NEWSLETTER_DELIVERY_MODE=development
```

Production behavior requires:

```text
NEWSLETTER_WEBHOOK_URL=<server-only provider endpoint>
```

No newsletter provider credentials were present in the repository, so no provider was invented or falsely integrated.

## 5. Navigation and Footer

A shared `CmsChromeContext` was added to the existing frontend chrome.

The catch-all route now wraps legacy fallback pages with normalized CMS Navigation and Footer data.

This allows the following route families to use the same CMS chrome pipeline:

- Homepage
- Global homepage
- About
- Contact
- Leadership
- Services
- Service details
- Industries
- Industry details
- Latest Thinking
- Article details
- Careers
- Job details
- Offices
- Office details
- CMS Pages

The frontend continues to own:

- Layout
- Desktop menus
- Mega menu behavior
- Mobile menu behavior
- Keyboard controls
- Search behavior
- Accessibility
- Responsive behavior

The CMS controls:

- Navigation labels
- Links
- Groups
- Ordering
- Visibility
- Mode
- CTA flags
- Footer quote
- Footer signature
- Footer links
- Legal links
- Social links
- Newsletter copy
- Copyright

Fallback navigation/footer data remains active when CMS records are missing.

## 6. Service and Industry Details

Service detail routes now use normalized CMS records as the primary source.

When present, the renderer uses:

- `shortDescription`
- `fullContent`
- SEO fields
- Mode

Industry detail routes now use normalized CMS records as the primary source.

When present, the renderer uses:

- `shortDescription`
- `fullContent`
- SEO fields
- Mode

Static detail records remain fallback options.

## 7. Article, Career, Office, and Leadership Status

### Articles

Article listings and details use CMS records when available. Existing content blocks, content type, author, publication date, featured media, relationships, SEO, and mode fields are normalized.

### Careers

Careers listings and job details use CMS Job records when published. The frontend supports:

- Application status
- Deadline
- Office relation slug
- Department
- Employment type
- Responsibilities
- Qualifications
- Requirements
- Benefits
- Application CTA

No application-processing backend was added.

### Offices

Office listings and details use CMS Office records when published. The frontend supports:

- City
- Country
- Address
- Phone
- Email
- Description blocks
- Media
- Latitude
- Longitude
- Mode
- SEO

### Leadership

Leadership listing and detail routes use CMS Leadership Profiles when records exist. No real leadership profiles were fabricated.

## 8. Media Status

Stage 3 preserves the Stage 2 Media architecture.

The frontend supports normalized:

- URL
- Alt text
- Width
- Height
- Caption

Strapi Media relationships are structurally available on migrated models and Page components.

Existing URL fields remain as compatibility fallbacks.

Existing real content records were not bulk-migrated because no approved media inventory or production media source was available. The seed does not download or fabricate production imagery.

## 9. Canonical URLs and India/Global

A single canonical utility now exists in `lib/site-url.ts`.

Supported configuration:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_INDIA_SITE_URL
NEXT_PUBLIC_GLOBAL_SITE_URL
```

The configured origin is selected by `SiteMode`.

Without explicit India/Global origins, the existing `NEXT_PUBLIC_SITE_URL` fallback remains active.

The application still uses `/global` as the explicit Global route. Full hostname/domain-based routing was not activated because production domain ownership and canonical rules were not provided.

No production domains were guessed or hardcoded.

## 10. Sitemap and Metadata

Sitemap generation now:

- Reads CMS Page paths
- Reads CMS Services
- Reads CMS Industries
- Reads CMS Articles
- Reads CMS Jobs
- Reads CMS Offices
- Reads CMS Leadership profiles
- Uses mode-aware canonical origins
- Deduplicates final URLs
- Uses CMS `updatedAt` values when present
- Preserves static fallback URLs
- Excludes drafts through the default published Strapi API behavior

Metadata generation continues to prefer CMS SEO and falls back to static route metadata.

Remaining limitation:

- Domain-aware URL behavior is configurable but not activated without explicit production domains.

## 11. Security and CORS

### Server-only secrets

Contact and newsletter provider URLs are read only by server route code.

Strapi API tokens remain server-only.

No new secret is exposed through `NEXT_PUBLIC_*` variables.

### Contact protection

- Server-side validation
- Email format validation
- Required consent
- Attachment size restriction
- Attachment MIME restriction
- Filename sanitization
- Safe failure when delivery is not configured

### Newsletter protection

- Server-side email validation
- Provider credentials remain server-only
- Safe failure when delivery is not configured

### Strapi CORS

Strapi CORS is now controlled by:

```text
CORS_ORIGINS
```

Local default:

```text
http://localhost:3000
```

Production must provide an explicit allowed-origin list.

A full penetration test was not performed.

## 12. Runtime and Adapter Coverage

Stage 2 contract checks remain available:

```bash
npm run test:stage2
```

Stage 3 checks are available with:

```bash
npm run test:stage3
```

The Stage 3 contract suite validates:

- Contact server route
- Newsletter server route
- Attachment policy
- Provider adapter boundaries
- CMS Contact Form section
- Shared CMS chrome
- Legacy route chrome provider
- Configurable canonical origins
- Sitemap timestamps
- Environment placeholders
- CORS configuration

The Stage 3 suite passed 17 checks.

A full runtime test framework was not introduced because the repository has no existing test runner and no test database/provider credentials. The endpoint and adapter boundaries are implemented, but external delivery was not exercised against a real provider.

## 13. Files Changed

### New files

- `app/api/contact/route.ts`
- `app/api/newsletter/route.ts`
- `components/contact-page.tsx`
- `cms/src/components/shared/contact-form.json`
- `lib/contact.ts`
- `lib/newsletter.ts`
- `scripts/validate-stage3.mjs`
- `docs/STAGE-3-REPORT.md`

### Modified files

- `app/[[...slug]]/page.tsx`
- `app/sitemap.ts`
- `components/cms-page.tsx`
- `components/igas-site.tsx`
- `lib/cms-content.ts`
- `lib/igas-data.ts`
- `lib/site-url.ts`
- `lib/strapi.ts`
- `cms/src/api/page/content-types/page/schema.json`
- `cms/src/index.ts`
- `cms/config/middlewares.ts`
- `.env.example`
- `cms/.env.example`
- `README.md`
- `docs/ARCHITECTURE.md`
- `package.json`

## 14. Validation Results

Passed:

```bash
npm run test:stage2
npm run test:stage3
npm run build
npm run build:cms
git diff --check
```

The Next.js build passed with TypeScript validation enabled.

The Strapi build passed with the new Contact Form component and CORS configuration.

The build logs expected fallback 404 warnings when the currently running local Strapi process has not reloaded the new Stage 3 endpoints. The frontend build still succeeds and preserves fallback behavior.

## 15. Remaining Hardcoded Content

Still static or fallback-only:

- Static fallback arrays in `lib/igas-data.ts`
- Cookie banner copy
- Search labels and behavior
- Focus-area grouping mechanics
- Some legacy section labels
- Static fallback metadata
- Static robots configuration
- Final client content records
- Final legal copy
- Production contact provider configuration
- Production newsletter provider configuration
- Existing production image records before approved Media Library migration

These are intentionally retained or require external decisions.

## 16. Deferred to Stage 4+

- Real email/CRM provider integration
- Real newsletter provider integration
- Attachment storage and binary delivery provider
- Rate limiting and abuse protection at the deployment edge
- Full runtime route/adapter test runner
- Domain-aware hostname routing activation
- Production media migration
- Final client content entry
- Final legal review
- Production database and infrastructure configuration
- Analytics and advanced search
- Webhook-driven cache invalidation

## 17. Recommended Stage 4

Stage 4 should focus on production integrations and content operations:

1. Approve and configure the contact delivery provider.
2. Approve and configure the newsletter provider.
3. Add rate limiting and abuse protection at the deployment layer.
4. Add a secure attachment storage/email delivery strategy.
5. Configure production India and Global origins.
6. Activate hostname-based mode routing only after canonical URL approval.
7. Migrate approved production imagery into the Strapi Media Library.
8. Add runtime tests with a test CMS environment.
9. Enter and review final client content.
10. Complete production CORS, permissions, database, and deployment configuration.
