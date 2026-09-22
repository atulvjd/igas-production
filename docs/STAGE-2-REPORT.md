# IGAS Stage 2 Report

**Stage:** 2 - Controlled CMS Migration and Content Model Foundation

**Baseline:** `docs/STAGE-1-REPORT.md`

**Scope:** CMS models, normalized adapter contracts, content migration foundations, route wiring, metadata, sitemap, seed data, and validation.

## 1. Stage 2 Summary

Stage 2 moved the project from a CMS foundation with only Services, Industries, Articles, Site Settings, and Pages into a broader CMS content architecture.

Implemented:

- Job content type
- Office content type
- Leadership Profile content type
- Navigation Item content type
- Footer content type
- Reusable SEO component
- Reusable Media component
- Reusable Footer Link component
- Reusable Social Link component
- Richer Service fields
- Richer Industry fields
- Richer Article fields
- Page SEO support
- Site Settings SEO support
- Optional Strapi Media fields while retaining URL fallbacks
- CMS normalization for Jobs, Offices, Leadership, Navigation, Footer, SEO, and Media
- CMS-backed Careers listing records
- CMS-backed Office listing records
- CMS-backed Leadership listing and detail records
- CMS-backed Office detail records
- CMS-backed Job detail records
- CMS-aware route metadata
- CMS-aware sitemap records
- `(path, mode)` lifecycle validation
- Opt-in non-destructive demo seed
- Lightweight Stage 2 contract validation
- Stage 2 architecture documentation

The existing design, fallback architecture, CMS Page Builder, and route structure were preserved.

This stage does not claim the entire site is fully CMS-controlled yet. Production forms, complete footer/navigation migration for every legacy route, domain-based mode routing, and client content entry remain future work.

## 2. Files Changed

### Frontend

- `app/[[...slug]]/page.tsx`
  - Uses CMS Jobs, Offices, Leadership, Services, Industries, and Articles for route resolution.
  - Uses CMS SEO for route metadata when present.
  - Preserves static fallback records.

- `app/sitemap.ts`
  - Changed sitemap generation to async.
  - Includes CMS Services, Industries, Articles, Jobs, Offices, Leadership, and Page paths.
  - Deduplicates URLs.
  - Preserves static fallback URLs.

- `components/igas-site.tsx`
  - Header accepts normalized CMS navigation.
  - Footer accepts normalized CMS footer data.
  - Homepage passes CMS navigation and footer data.
  - Listing pages use normalized CMS Jobs and Offices.
  - Existing visual presentation and interaction behavior remain intact.

- `components/cms-page.tsx`
  - CMS Pages now receive normalized navigation and footer data.
  - Existing Dynamic Zone renderers remain in place.

- `components/cms-directory-pages.tsx`
  - Added CMS Leadership listing/detail rendering.
  - Added CMS Office detail rendering.
  - Preserves existing editorial detail-page styling patterns.

- `lib/cms-content.ts`
  - Added normalized domain types for CMS SEO, Jobs, Offices, Leadership, Navigation, Footer, and Page data.
  - Added fallback shapes for new collections.
  - Extended normalized media with caption support.

- `lib/igas-data.ts`
  - Extended fallback domain interfaces with optional Stage 2 fields.
  - Existing fallback data was not removed.

### CMS schemas

- `cms/src/api/job/content-types/job/schema.json`
  - Added Job collection.

- `cms/src/api/office/content-types/office/schema.json`
  - Added Office collection.

- `cms/src/api/leadership-profile/content-types/leadership-profile/schema.json`
  - Added Leadership Profile collection.

- `cms/src/api/navigation-item/content-types/navigation-item/schema.json`
  - Added Navigation Item collection.

- `cms/src/api/footer/content-types/footer/schema.json`
  - Added Footer collection.

- `cms/src/api/page/content-types/page/schema.json`
  - Added reusable SEO component to Pages.

- `cms/src/api/site-setting/content-types/site-setting/schema.json`
  - Added reusable SEO component to Site Settings.

- `cms/src/api/service/content-types/service/schema.json`
  - Added full content, optional short description, hero media, relationships, mode, and SEO.
  - Existing required `description` was preserved for compatibility.

- `cms/src/api/industry/content-types/industry/schema.json`
  - Added full content, optional short description, hero media, relationships, mode, and SEO.
  - Existing required `description` was preserved for compatibility.

- `cms/src/api/article/content-types/article/schema.json`
  - Added featured Media, content type, author, publication date, featured flag, relationships, mode, and SEO.

### CMS reusable components

- `cms/src/components/shared/seo.json`
  - Reusable meta title, description, canonical, no-index, Open Graph, and Twitter fields.

- `cms/src/components/shared/media.json`
  - Reusable Strapi Media file, alt, and caption structure.

- `cms/src/components/shared/footer-link.json`
  - Repeatable footer/useful/legal link structure.

- `cms/src/components/shared/social-link.json`
  - Repeatable social link structure.

- Existing Hero, Image/Text, and Carousel Slide components
  - Added optional reusable Media fields while preserving existing URL fields.

### CMS runtime and validation

- `cms/src/api/page/content-types/page/lifecycles.ts`
  - Enforces unique `(path, mode)` combinations during create and update.

- `cms/src/index.ts`
  - Added opt-in non-destructive demo seed through `SEED_DEMO_CONTENT=true`.

- `cms/types/generated/components.d.ts`
  - Regenerated by Strapi build.

- `cms/types/generated/contentTypes.d.ts`
  - Regenerated by Strapi build.

- `lib/strapi.ts`
  - Added normalizers and collection fetches for all Stage 2 entities.
  - Added normalized Media and SEO handling.
  - Added CMS Page path lookup for sitemap generation.

### Documentation and tooling

- `README.md`
  - Documents Stage 2 collections, seed usage, and contract validation.

- `docs/ARCHITECTURE.md`
  - Updated with a Stage 2 addendum.

- `scripts/validate-stage2.mjs`
  - Added 48 lightweight contract checks.

- `package.json`
  - Added `npm run test:stage2`.

## 3. New Strapi Content Types

### Job

Fields:

- `title`
- `slug`
- `shortDescription`
- `description`
- `responsibilities`
- `qualifications`
- `requirements`
- `benefits`
- `department`
- `employmentType`
- `location`
- `office` relationship
- `applicationCTA`
- `applicationStatus`
- `deadline`
- `sortOrder`
- `mode`
- `seo`
- Draft/publish support

Long-form fields use Strapi Blocks.

`applicationStatus` supports:

- `open`
- `paused`
- `closed`

### Office

Fields:

- `name`
- `slug`
- `city`
- `country`
- `address`
- `phone`
- `email`
- `description`
- `image`
- Legacy `imageUrl`
- Legacy `imageAlt`
- `latitude`
- `longitude`
- `services` relationship
- `mode`
- `sortOrder`
- `seo`
- Draft/publish support

No office address or coordinate data was fabricated by the seed. Demo records are explicitly marked with `[Demo]`.

### Leadership Profile

Fields:

- `name`
- `slug`
- `position`
- `biography`
- `profileImage`
- `email`
- `linkedInUrl`
- `relatedServices`
- `relatedIndustries`
- `sortOrder`
- `mode`
- `seo`
- Draft/publish support

No real leadership profile was fabricated. The optional seed record is clearly labeled `[Demo]`.

### Navigation Item

Fields:

- `label`
- `href`
- `group`
- `parentGroup`
- `menuType`
- `external`
- `cta`
- `visible`
- `mode`
- `order`
- Draft/publish support

`menuType` supports:

- `header`
- `mobile`
- `footer`

### Footer

Fields:

- `mode`
- `quote`
- `quoteAuthor`
- `signature`
- `contactEmail`
- `contactPhone`
- `newsletterTitle`
- `newsletterDescription`
- `copyright`
- Repeatable useful links
- Repeatable legal links
- Repeatable social links
- Draft/publish support

## 4. Updated Content Types

### Service

Added:

- `shortDescription`
- `fullContent`
- `heroImage`
- `relatedIndustries`
- `relatedArticles`
- `relatedLeadership`
- `mode`
- `seo`

The original `description`, `slug`, `tag`, and `sortOrder` fields remain.

### Industry

Added:

- `shortDescription`
- `fullContent`
- `heroImage`
- `relatedServices`
- `relatedArticles`
- `mode`
- `seo`

The original `description`, `slug`, `imageUrl`, `imageAlt`, and `sortOrder` fields remain.

### Article

Added:

- `featuredImage`
- `contentType`
- `author`
- `publicationDate`
- `featured`
- `relatedArticles`
- `relatedServices`
- `relatedIndustries`
- `mode`
- `seo`

`contentType` supports:

- `news`
- `blog`
- `story`
- `insight`

The existing `date`, `imageUrl`, `imageAlt`, and `content` fields remain.

### Page

Added reusable `seo` component support.

The existing Dynamic Zone remains unchanged and continues to support:

- Hero
- Rich Text
- Image and Text
- Stats
- Carousel
- CTA

### Site Settings

Added reusable `seo` component support.

Existing India and Global settings remain intact.

## 5. Media Architecture

The architecture now supports Strapi Media through the reusable `shared.media` component.

Migrated structurally:

- Services hero media
- Industry hero media
- Article featured media
- Office image media
- Leadership profile media
- Hero section media
- Image/Text section media
- Carousel slide media
- SEO Open Graph image
- SEO Twitter image

The following legacy URL fields remain for compatibility:

- `imageUrl`
- `imageAlt`
- `heroImageUrl`
- `aboutImageUrl`
- `careersImageUrl`

The normalized frontend media shape is:

```text
CmsMedia
├── src
├── alt
├── width
├── height
└── caption
```

Raw Strapi media responses are normalized inside `lib/strapi.ts` and are not intentionally exposed to UI components.

Existing fallback media remains available if CMS media is absent.

## 6. Navigation Status

The Header can now consume normalized CMS Navigation Items.

CMS navigation is used when:

- A CMS Page is rendered.
- The homepage receives CMS content with Navigation Items.

If no CMS navigation exists, the existing static navigation groups remain active.

The frontend still owns:

- Desktop dropdown behavior
- Focus-area mega menu behavior
- Mobile navigation behavior
- Keyboard and Escape-key behavior
- Search behavior
- Accessibility attributes
- Visual layout

The CMS owns labels, links, group names, order, visibility, mode, CTA flag, and external-link metadata.

Legacy fallback route components still use static navigation unless they are migrated to receive the normalized CMS content directly.

## 7. Footer Status

The Footer can now consume normalized CMS Footer content.

CMS-controlled footer fields include:

- Quote
- Quote author
- Signature
- Newsletter title
- Newsletter description
- Copyright
- Contact fields
- Useful links
- Legal links
- Social links

CMS footer data is connected to:

- CMS-authored Pages
- CMS-backed homepage content

Static footer copy remains the fallback when no CMS Footer record exists.

The frontend still owns footer layout, responsive behavior, newsletter interaction, accessibility, and rendering.

## 8. Page Migration Status

| Page | CMS source | Fallback source | Status |
|---|---|---|---|
| Home | Page Dynamic Zone or Site Content | HomePage and static data | CMS-ready with fallback |
| Global | Page Dynamic Zone or Global Site Content | Global HomePage | CMS-ready with fallback |
| About | Page Dynamic Zone | AboutPage | CMS Page supported, migration not seeded |
| Leadership | Leadership Profile collection or Page | Static DetailPage | CMS listing/detail connected |
| Services | Services collection or Page | Static service data | CMS listing connected |
| Service Detail | Service collection or Page | Static service data | Rich schema added, full renderer migration pending |
| Industries | Industries collection or Page | Static industry data | CMS listing connected |
| Industry Detail | Industry collection or Page | Static industry data | Rich schema added, full renderer migration pending |
| Latest Thinking | Articles collection or Page | Static article data | CMS listing connected |
| Article Detail | Article collection or Page | Static article data | CMS content blocks connected |
| Careers | Job collection or Page | Static job data | CMS listing connected |
| Job Detail | Job collection or Page | Static job data | CMS detail lookup connected |
| Offices | Office collection or Page | Static office data | CMS listing/detail connected |
| Contact | Page Dynamic Zone or ContactPage | Static ContactPage | CMS Page supported, form integration pending |

## 9. SEO Status

A reusable `shared.seo` component now supports:

- `metaTitle`
- `metaDescription`
- `canonicalUrl`
- `noIndex`
- `ogTitle`
- `ogDescription`
- `ogImage`
- `twitterImage`

SEO support is available on:

- Pages
- Site Settings
- Services
- Industries
- Articles
- Jobs
- Offices
- Leadership Profiles

The Next.js metadata layer now checks CMS Page SEO and normalized item SEO before using static metadata.

Fallback metadata remains active when CMS SEO is absent.

The sitemap now includes:

- Static routes
- CMS Page paths
- CMS Services
- CMS Industries
- CMS Articles
- CMS Jobs
- CMS Offices
- CMS Leadership profiles

Draft content is excluded because Strapi REST requests use the default published-content behavior.

Remaining limitations:

- CMS page paths are not yet domain-specific.
- Sitemap entries do not yet carry per-record `lastModified` dates.
- Open Graph media may require absolute URLs for production deployments.
- Domain-aware India/Global canonical strategy is not yet implemented.

## 10. India and Global Status

Mode support now exists on:

- Pages
- Site Settings
- Services
- Industries
- Articles
- Jobs
- Offices
- Leadership Profiles
- Navigation Items
- Footers

The frontend still uses `/global` as the explicit Global route. Other routes default to India mode.

The Page lifecycle validates that no duplicate `(path, mode)` pair is created or updated.

Allowed:

```text
path = /
mode = india

path = /
mode = global
```

Rejected:

```text
path = /
mode = india

path = /
mode = india
```

Domain-aware routing remains deferred because it affects canonical URLs, navigation, metadata, and deployment configuration.

## 11. Seed Data

The seed is located in `cms/src/index.ts`.

Run it with:

```bash
SEED_DEMO_CONTENT=true npm run dev:cms
```

The seed is:

- Opt-in
- Repeatable
- Non-destructive
- Existing-record aware
- Clearly marked as demo content

It checks/creates:

- India Site Settings
- Global Site Settings
- Demo Office
- Demo Job
- Demo Leadership Profile
- Demo Navigation Item
- Demo Footer
- Demo Page at `/demo-stage-2`

It does not overwrite existing records and does not claim demo records are real IGAS content.

## 12. Testing

Pre-flight Stage 1 validation passed before Stage 2 changes:

```bash
npm run build
npm run build:cms
```

Stage 2 validation:

```bash
npm run test:stage2
npm run build
npm run build:cms
git diff --check
```

The Stage 2 contract script passed 48 checks covering:

- Dynamic Zone components
- SEO support
- Page path behavior
- Job schema
- Office schema
- Leadership schema
- Navigation schema
- Footer schema
- Draft/publish support
- Adapter normalizers
- Route hooks
- Sitemap CMS integration
- Lifecycle and seed files

The Next.js build passed with TypeScript validation enabled.

The Strapi build passed, including the new schemas, components, lifecycle, seed bootstrap, admin panel, and generated types.

The frontend build logs expected 404 fallback warnings when the currently running local Strapi process does not expose the newly added endpoints. The build still completes successfully and falls back to static content as designed.

No full runtime adapter test framework has been added yet.

## 13. Remaining Hard-Coded Content

Still hard-coded or fallback-only:

- Legacy AboutPage content
- Legacy ContactPage labels and form behavior
- Static fallback job data
- Static fallback office data
- Static fallback article/service/industry data
- Some Header navigation on legacy fallback pages
- Some Footer navigation on legacy fallback pages
- Cookie banner copy
- Search labels and behavior
- Focus-area grouping logic
- Static page metadata fallback
- Static robots configuration
- Some homepage section headings
- Contact submission handling
- Newsletter submission handling
- Office and Job fallback descriptions

These fallbacks are intentionally retained.

## 14. Issues Deferred

Deferred to Stage 3 or later:

- Contact email/CRM integration
- Newsletter provider integration
- Secure career application backend
- CV upload processing and scanning
- Full domain-aware India/Global routing
- Production CORS restrictions
- Full Strapi Media migration of existing records
- Complete legacy fallback Header/Footer CMS wiring
- Full CMS migration of About, Contact, and all page copy
- Sitemap last-modified dates
- Webhook cache invalidation
- Full automated route and adapter test framework
- Final client content entry
- Final legal content
- Production deployment configuration
- Production database migration
- Analytics and advanced search

## 15. Recommended Stage 3

Stage 3 should focus on completing content ownership and operational integrations:

1. Migrate About, Contact, and remaining legacy routes into CMS Pages.
2. Ensure every fallback route receives CMS Navigation and Footer data.
3. Migrate existing URL-based images to Strapi Media Library records.
4. Add contact submission backend with spam protection and attachment policy.
5. Add newsletter provider integration.
6. Add domain-aware India/Global routing only after canonical rules are approved.
7. Add full runtime adapter and route tests.
8. Add sitemap last-modified and canonical URL handling.
9. Apply production CORS and API permission restrictions.
10. Begin final client content entry only after the models are approved.
