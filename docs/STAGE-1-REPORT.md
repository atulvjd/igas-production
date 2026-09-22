# IGAS Stage 1 Website Report

**Report scope:** Architecture, CMS foundation, routing, data flow, security, fallback behavior, and validation.

**Status:** Stage 1 audit and foundation hardening completed.

## 1. Executive Summary

IGAS is a Next.js App Router website backed by an optional Strapi 5 REST CMS. The frontend has a complete static fallback dataset, so it can render without Strapi. When server-side Strapi configuration is available, Services, Industries, Articles, Site Settings, and published CMS Pages can be loaded from the CMS.

The CMS Page Builder uses Strapi Dynamic Zones and currently supports Hero, Rich Text, Image and Text, Stats, Carousel, and Call to Action sections. A published CMS Page takes precedence over the existing fallback route for a matching path and mode.

The foundation is functional but the website is not yet completely CMS-driven. Jobs, Offices, Leadership, Navigation, Footer content, SEO fields, contact handling, newsletter handling, and some route content remain static or frontend-only.

Stage 1 foundation fixes completed:

- TypeScript build errors are no longer ignored.
- CMS collection failures fall back independently.
- The route loads only the current site mode.
- CMS-created service, industry, and article slugs can resolve through detail routes.
- India and Global CMS Pages can share equivalent paths.
- `NEXT_PUBLIC_SITE_URL` is documented in the root environment example.
- A verified architecture document exists at `docs/ARCHITECTURE.md`.

## 2. Technology Stack

### Frontend

- Next.js `16.3.3`
- React `19`
- TypeScript
- Next.js App Router
- `lucide-react`
- Tailwind CSS imports
- Custom CSS in `app/globals.css`
- Server-side CMS fetching
- Client-side interaction components

### CMS

- Strapi `5.53.0`
- SQLite for local development
- REST API
- Draft and publish support
- Dynamic Zones
- Generated TypeScript types

## 3. Repository Structure

```text
app/
  layout.tsx                 Global metadata, viewport, analytics, global CSS
  globals.css                Global styling and design tokens
  not-found.tsx              Next.js not-found entry
  robots.ts                  Robots metadata
  sitemap.ts                 Sitemap generation
  [[...slug]]/page.tsx       Catch-all route and CMS/fallback selection

components/
  igas-site.tsx              Main fallback UI and route components
  cms-page.tsx               CMS Dynamic Zone page renderer
  seo-structured-data.tsx    Structured data components
  ui/button.tsx              Shared button primitive

lib/
  igas-data.ts               Static domain types and fallback content
  cms-content.ts             CMS domain types and fallback composition
  strapi.ts                  Server-only Strapi adapter
  site-url.ts                Canonical URL helpers
  utils.ts                   General utilities

cms/
  config/                    Strapi configuration
  src/api/                   Strapi content types and core handlers
  src/components/            Reusable Dynamic Zone components
  types/generated/           Generated Strapi types
  database/migrations/       Database migration directory
  public/uploads/            Local upload directory

public/
  Static frontend assets

docs/
  ARCHITECTURE.md            Verified architecture reference
  STAGE-1-REPORT.md          This detailed Stage 1 report
```

## 4. Actual Data Flow

### CMS Page request

```text
Browser
  -> Next.js catch-all route
  -> Read pathname
  -> Determine India or Global mode
  -> getStrapiPage(pathname, mode)
  -> Authenticated server-side request to Strapi
  -> Normalize Dynamic Zone data
  -> CmsPage renderer
  -> Render CMS sections
```

### Fallback request

```text
Browser
  -> Next.js catch-all route
  -> CMS Page lookup returns no page
  -> getStrapiContent(mode)
  -> Fetch Services, Industries, Articles, Site Settings
  -> Normalize records
  -> Use static fallback for missing or failed collections
  -> Render route-specific React component
```

The main route is `app/[[...slug]]/page.tsx`.

The CMS adapter is `lib/strapi.ts`.

The normalized CMS model is `lib/cms-content.ts`.

The static fallback model is `lib/igas-data.ts`.

## 5. Route Inventory

| Route | Current renderer | CMS support | Static fallback |
|---|---|---:|---:|
| `/` | HomePage or CMS Page | Yes | Yes |
| `/global` | Global HomePage or CMS Page | Yes | Yes |
| `/about` | AboutPage or CMS Page | Yes | Yes |
| `/leadership` | DetailPage or CMS Page | Partial | Yes |
| `/contact` | ContactPage or CMS Page | Partial | Yes |
| `/services` | ListingPage or CMS Page | Yes | Yes |
| `/services/[slug]` | DetailPage | Partial | Yes |
| `/industries` | ListingPage or CMS Page | Yes | Yes |
| `/industries/[slug]` | DetailPage | Partial | Yes |
| `/latest-thinking` | ListingPage or CMS Page | Yes | Yes |
| `/latest-thinking/[slug]` | DetailPage | Partial | Yes |
| `/careers` | ListingPage or CMS Page | Partial | Yes |
| `/careers/[slug]` | DetailPage | Partial | Yes |
| `/offices` | ListingPage or CMS Page | Partial | Yes |
| Custom CMS paths | CmsPage | Yes | No route-specific fallback |
| 404 | Static not-found page | No | Yes |

## 6. CMS Inventory

| Entity | Exists | CMS-driven | Static fallback | Current status |
|---|---:|---:|---:|---|
| Services | Yes | Yes | Yes | Collection supports listing and recognized detail slugs |
| Industries | Yes | Yes | Yes | Collection supports listing and recognized detail slugs |
| Articles | Yes | Yes | Yes | Collection supports listing and content blocks |
| Site Settings | Yes | Yes | Yes | India and Global settings merge over defaults |
| Pages | Yes | Yes | Yes | Dynamic Zone pages override fallback routes |
| Jobs | No | No | Yes | Static job records only |
| Offices | No | No | Yes | Static office records only |
| Leadership | No | No | Yes | Static content only |
| Navigation | No | No | Yes | Static navigation groups |
| Footer | No | No | Yes | Static footer links and copy |
| SEO records | No | No | Yes | Static route metadata |
| Contact enquiries | No | No | No | Frontend-only success state |
| Newsletter subscribers | No | No | No | Frontend-only success state |

## 7. Actual Strapi Content Types

### Service

File: `cms/src/api/service/content-types/service/schema.json`

Fields:

- `title`: required string
- `slug`: required UID
- `description`: required text
- `tag`: optional string
- `sortOrder`: integer with default `0`
- Draft and publish enabled

### Industry

File: `cms/src/api/industry/content-types/industry/schema.json`

Fields:

- `title`: required string
- `slug`: required UID
- `description`: required text
- `imageUrl`: optional string
- `imageAlt`: optional string
- `sortOrder`: integer with default `0`
- Draft and publish enabled

### Article

File: `cms/src/api/article/content-types/article/schema.json`

Fields:

- `title`: required string
- `slug`: required UID
- `excerpt`: required text
- `category`: required string
- `date`: required date
- `imageUrl`: optional string
- `imageAlt`: optional string
- `content`: Strapi blocks field
- Draft and publish enabled

### Site Setting

File: `cms/src/api/site-setting/content-types/site-setting/schema.json`

Fields include:

- `mode`
- Hero eyebrow, title, intro, CTA, image
- Statement title and intro
- About title, text, and image
- Presence title and text
- Careers title, text, and image
- Newsletter title
- Footer signature
- Contact email and phone

`mode` supports `india` and `global`.

### Page

File: `cms/src/api/page/content-types/page/schema.json`

Fields:

- `path`
- `mode`
- `title`
- `description`
- `sections`

`sections` is a Dynamic Zone supporting:

- `shared.hero`
- `shared.rich-text`
- `shared.image-text`
- `shared.stats`
- `shared.carousel`
- `shared.cta`

The Page `path` field no longer has a global unique constraint. This allows India and Global to share equivalent paths. Compound uniqueness of `(path, mode)` is not yet enforced at database level.

## 8. Dynamic Zone Components

### Hero

Editable fields:

- Eyebrow
- Title
- Intro
- CTA label
- CTA link
- Image URL

### Rich Text

Editable fields:

- Eyebrow
- Title
- Rich text body
- Theme

Available themes:

- Light
- Dark
- Accent

### Image and Text

Editable fields:

- Eyebrow
- Title
- Body
- Image URL
- Image alt text
- Image position
- CTA label
- CTA link

### Stats

Editable fields:

- Eyebrow
- Title
- Intro
- Repeatable stat items

### Stat Item

Editable fields:

- Value
- Label
- Detail

### Carousel

Editable fields:

- Eyebrow
- Title
- Repeatable slides

### Carousel Slide

Editable fields:

- Category
- Date
- Title
- Excerpt
- Image URL
- Image alt text
- Link URL

### CTA

Editable fields:

- Eyebrow
- Title
- Body
- Button label
- Button URL
- Theme

## 9. Hardcoded Content Inventory

### Appropriate UI content

The following can reasonably remain in code:

- Accessibility labels
- ARIA labels
- Search mechanics
- Keyboard behavior
- Form validation rules
- Loading and empty-state mechanics
- Cookie storage mechanics
- Component rendering rules
- Error handling
- API authentication logic

### Fallback content

The following currently lives in `lib/igas-data.ts`:

- Services
- Industries
- Articles
- Offices
- Jobs
- Statistics
- Taglines
- Site settings
- Focus groups
- Navigation groups

This data should remain until CMS migration is complete and verified.

### Content recommended for later CMS migration

- Header navigation
- Footer navigation
- Footer legal links
- About page copy
- Leadership profiles
- Office records
- Job records
- Contact page copy
- Newsletter copy
- Detail page bodies
- SEO metadata
- Statistics
- Site-wide labels
- Focus-area descriptions
- India/Global-specific navigation

## 10. India and Global Architecture

Current mode selection:

- `/` uses India mode.
- `/global` uses Global mode.
- Other routes currently default to India mode.
- Site Settings are filtered by mode.
- CMS Pages are filtered by both path and mode.
- Services, Industries, Articles, Jobs, and Offices do not currently have mode fields.
- `getSiteMode(hostname)` exists but is not connected to request headers or middleware.
- `hrefFor(mode, path)` exists but is not currently used by navigation.

The previous global uniqueness problem on Page `path` was removed. However, duplicate records with the same path and mode are still possible until custom validation or a database constraint is added.

## 11. Security Status

`STRAPI_API_TOKEN` is read only inside the server-side CMS adapter.

There is no `NEXT_PUBLIC_STRAPI_API_TOKEN` variable.

The token is not passed to client components.

The token is sent to Strapi using a Bearer Authorization header.

The root `.env.local` file is ignored by Git and is not tracked. Real secrets must never be committed, logged, or copied into `.env.example`. Any token that has been shared outside the local machine should be rotated in Strapi.

CMS secrets are expected in `cms/.env` and include:

- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

Strapi currently uses generic CORS middleware. Production should restrict CORS to the actual frontend domains.

## 12. Media Status

Images currently come from:

- External fallback URLs
- CMS URL string fields
- Static public assets
- Optional Strapi uploads

The main CMS models do not yet use Strapi Media relations for visual content.

The frontend has partial media normalization with:

- URL
- Alt text
- Width
- Height
- Caption

Future media work should use proper Strapi Media fields, responsive formats, captions, and focal point handling.

## 13. Fallback Behavior

If CMS environment variables are missing, static fallback content is used.

If one Strapi collection fails, only that collection falls back.

If a CMS Page is missing or fails to load, the existing route-specific page is used.

If CMS records are empty, fallback records are used where available.

This prevents a CMS outage from completely breaking the website.

## 14. Caching and Performance

Strapi requests use Next.js revalidation of approximately 60 seconds.

There is no webhook or on-demand revalidation system yet.

CMS Page requests return early when a published CMS Page exists.

Fallback data fetching is performed only for the selected site mode.

Services, Industries, Articles, and Site Settings are requested in parallel.

The current collection limit is 100 records. Pagination beyond that limit is not implemented.

## 15. Routing and Metadata

Routing is centralized in `app/[[...slug]]/page.tsx`.

Metadata uses static route definitions and fallback static item lookups.

The sitemap uses static arrays from `lib/igas-data.ts`.

CMS-created pages and records are not yet automatically included in metadata or sitemap generation.

This is deferred to the next CMS migration stage.

## 16. Forms

### Contact form

The UI includes:

- Name
- Work email
- Message
- Optional attachment
- Consent checkbox
- Success state

It does not yet submit to a backend, CRM, email service, or database.

### Newsletter form

The UI includes an email input and success state.

It does not yet connect to an email provider.

## 17. Stage 1 Changes

### `next.config.mjs`

Removed `typescript.ignoreBuildErrors` so builds enforce TypeScript correctness.

### Page schema

Removed global uniqueness from Page `path` so equivalent India and Global paths are possible.

### `.env.example`

Added the existing `NEXT_PUBLIC_SITE_URL` variable.

### `lib/strapi.ts`

Added independent safe collection requests and normalized CMS data handling.

### `app/[[...slug]]/page.tsx`

Changed route loading so only the selected mode is fetched. CMS-created Service, Industry, and Article records are preferred for detail routes.

### `docs/ARCHITECTURE.md`

Added a verified architecture reference.

### `docs/STAGE-1-REPORT.md`

Added this complete Stage 1 report.

No visual redesign or broad content migration was performed in Stage 1.

## 18. Issues Deferred to Later Stages

The following were intentionally not implemented in Stage 1:

- Jobs CMS collection
- Offices CMS collection
- Leadership CMS collection
- Navigation CMS collection
- Footer CMS collection
- Full SEO CMS model
- Strapi Media migration
- Contact backend
- Newsletter provider
- Hostname-based India/Global routing
- CMS-driven sitemap
- CMS-driven route metadata
- Compound Page `(path, mode)` database validation
- Automated test suite
- CMS seed data
- Pagination beyond 100 records
- Webhook-based cache invalidation

These items require product, content, deployment, privacy, or integration decisions and belong in later stages.

## 19. Validation Results

The following commands passed:

```bash
npm run build
npm run build:cms
git diff --check
```

The Next.js build completed with TypeScript validation enabled.

The Strapi build completed successfully, including Dynamic Zone components and generated types.

## 20. Recommended Stage 2

Stage 2 should focus on controlled CMS migration:

1. Add Jobs, Offices, Leadership, Navigation, Footer, and SEO models.
2. Migrate About and Leadership.
3. Migrate Offices and Careers.
4. Add rich detail content for Services and Industries.
5. Migrate Contact and Footer content.
6. Add proper Strapi Media fields.
7. Add CMS-driven metadata and sitemap generation.
8. Add compound `(path, mode)` validation.
9. Add CMS seed data for local development.
10. Add adapter and route tests.
11. Connect Contact and Newsletter integrations.
12. Add domain-aware India/Global routing only after canonical URL rules are finalized.
