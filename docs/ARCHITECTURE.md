# IGAS Architecture

This document describes the implementation currently present in the repository. It intentionally distinguishes implemented behavior from planned CMS migration work.

## 1. Executive Summary

IGAS is a Next.js App Router frontend backed by an optional Strapi 5 REST API. The frontend has a complete static fallback dataset, so the site can render without Strapi. When server-side Strapi configuration is present, services, industries, articles, site settings, and published page-builder records are loaded from CMS.

The page builder is implemented with a Strapi Page collection and dynamic zones. It currently supports Hero, Rich text, Image and text, Stats, Carousel, and Call to action sections. A published CMS Page takes precedence for a matching path and mode; otherwise the existing route-specific React page is used.

The foundation is usable for the next CMS migration stage, but it is not yet a fully CMS-driven production site. Jobs, offices, leadership, navigation, footer content, contact handling, newsletter handling, SEO fields, and some route metadata remain static or frontend-only. The CMS detail-page and mode model also need further work before all content can be managed consistently.

## 2. Repository Structure

```text
app/
  layout.tsx                 Global metadata, viewport, analytics, global CSS
  globals.css                Global design tokens and component styling
  [[...slug]]/page.tsx       Catch-all route, CMS lookup, fallback route selection
  not-found.tsx              Next.js not-found entry
  robots.ts                  Robots metadata
  sitemap.ts                 Static sitemap generation
components/
  igas-site.tsx              Main legacy/fallback UI and page components
  cms-page.tsx               Dynamic-zone CMS page renderer
  seo-structured-data.tsx    Organization and breadcrumb structured data
  ui/button.tsx              Shared button primitive
lib/
  igas-data.ts               Static domain types and fallback content
  cms-content.ts             Normalized CMS domain types and fallback composition
  strapi.ts                  Server-side Strapi REST adapter and normalization
  site-url.ts                Canonical URL helpers
  utils.ts                   General utilities
cms/
  config/                    Strapi server, database, API, middleware, admin config
  src/api/                   Strapi collection type schemas and core handlers
  src/components/            Reusable Strapi dynamic-zone component schemas
  types/generated/           Strapi-generated TypeScript types
  database/migrations/       Database migration directory
  public/uploads/            Local upload directory
public/
  Static public assets and fallback site files
```

Important root configuration files are `package.json`, `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `.env.example`, and `.gitignore`. The repository also contains `AGENTS.md` and `CLAUDE.md` instruction files.

## 3. Request and Data Flow

### Fallback or CMS Page request

```text
Browser request
  -> app/[[...slug]]/page.tsx
  -> derive pathname and mode
  -> getStrapiPage(pathname, mode)
  -> GET /api/pages with server-only bearer token
  -> normalize dynamic-zone sections
  -> CmsPage renderer

If no published CMS Page exists:
  -> getStrapiContent(mode)
  -> GET services, industries, articles, site-settings independently
  -> normalize records into CmsContent
  -> route-specific fallback component in igas-site.tsx
```

`STRAPI_URL` and `STRAPI_API_TOKEN` are read in `lib/strapi.ts`, which is used by the server route. The token is not passed as a prop and is not imported by the client-side UI component.

Strapi fetches use `next: { revalidate: 60 }`. A successful response can therefore remain cached for up to approximately one minute depending on the Next.js deployment cache.

## 4. Route Behavior

| Route | Current renderer | CMS support | Fallback |
|---|---|---|---|
| `/` | `HomePage` unless a CMS Page exists | Page dynamic zone | Yes |
| `/global` | Global `HomePage` unless a CMS Page exists | Page dynamic zone | Yes |
| `/about` | `AboutPage` unless a CMS Page exists | Page dynamic zone | Yes |
| `/leadership` | `DetailPage` unless a CMS Page exists | Page dynamic zone | Yes |
| `/contact` | `ContactPage` unless a CMS Page exists | Page dynamic zone | Yes |
| `/services` | `ListingPage` unless a CMS Page exists | Services collection or Page | Yes |
| `/services/[slug]` | `DetailPage` | CMS listing slug plus fallback static slug | Yes |
| `/industries` | `ListingPage` unless a CMS Page exists | Industries collection or Page | Yes |
| `/industries/[slug]` | `DetailPage` | CMS listing slug plus fallback static slug | Yes |
| `/latest-thinking` | `ListingPage` unless a CMS Page exists | Articles collection or Page | Yes |
| `/latest-thinking/[slug]` | `DetailPage` | CMS article lookup and article blocks | Yes |
| `/careers` | `ListingPage` unless a CMS Page exists | Static jobs or Page | Yes |
| `/careers/[slug]` | `DetailPage` | Static jobs or Page | Yes |
| `/offices` | `ListingPage` unless a CMS Page exists | Static offices or Page | Yes |
| custom CMS path | `CmsPage` when published | Page dynamic zone | No route-specific fallback |

The current route selects `global` only for `/global`; all other routes select `india`. Hostname-based mode detection exists as `getSiteMode()` in `lib/igas-data.ts` but is not currently connected to request headers or domain routing.

## 5. CMS Inventory

| Entity | Exists | CMS-driven | Static fallback | Current status |
|---|---:|---:|---:|---|
| Services | Yes | Yes | Yes | Collection feeds listings and recognized detail slugs |
| Industries | Yes | Yes | Yes | Collection feeds listings and recognized detail slugs |
| Articles | Yes | Yes | Yes | Collection feeds listings and article body blocks |
| Site settings | Yes | Yes | Yes | India/global settings merge over defaults |
| Pages | Yes | Yes | Yes | Dynamic-zone pages override fallback routes |
| Jobs | No | No | Yes | Static job records only |
| Offices | No | No | Yes | Static office records only |
| Leadership | No | No | Yes | Static page copy only |
| Navigation | No | No | Yes | Static navigation groups |
| Footer | No | No | Yes | Static links and copy |
| Contact enquiries | No | No | No | Frontend-only success state |
| Newsletter subscribers | No | No | No | Frontend-only success state |
| SEO records | No | No | Yes | Static route metadata |

## 6. Actual Strapi Models

### Service

Defined in `cms/src/api/service/content-types/service/schema.json`.

Fields:

- `title`: required string
- `slug`: required UID
- `description`: required text
- `tag`: optional string
- `sortOrder`: integer with default `0`
- Draft and publish enabled

### Industry

Fields:

- `title`: required string
- `slug`: required UID
- `description`: required text
- `imageUrl`: optional string
- `imageAlt`: optional string
- `sortOrder`: integer with default `0`
- Draft and publish enabled

### Article

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

### Site setting

Fields include mode, hero copy, homepage statement copy, about copy, presence copy, careers copy, image URLs, newsletter title, footer signature, and contact details. `mode` is an enumeration of `india` and `global` and is unique.

### Page

Defined in `cms/src/api/page/content-types/page/schema.json`.

Fields:

- `path`: required string
- `mode`: required `india` or `global` enumeration
- `title`: required string
- `description`: optional text
- `sections`: dynamic zone
- Draft and publish enabled

The global uniqueness constraint was removed from `path` during Stage 1 so that India and Global can share the same URL path. Strapi does not enforce a compound unique constraint in this schema. Duplicate `(path, mode)` records must therefore be prevented through editorial process or a future custom validation/lifecycle implementation.

### Reusable components

The dynamic zone currently supports:

- `shared.hero`
- `shared.rich-text`
- `shared.image-text`
- `shared.stats`
- `shared.carousel`
- `shared.cta`

`shared.stats` contains repeatable `shared.stat-item` components. `shared.carousel` contains repeatable `shared.carousel-slide` components.

## 7. CMS Adapter and Types

The intended data boundary is:

```text
Strapi REST response
  -> lib/strapi.ts
  -> normalized CmsContent / CmsPage / CmsSection types
  -> React UI
```

`lib/strapi.ts` unwraps Strapi record attributes, normalizes services, industries, articles, settings, pages, and dynamic-zone sections, and returns frontend-oriented objects. Raw Strapi response objects are not intentionally passed into the UI.

`lib/cms-content.ts` owns the fallback `CmsContent` construction and the frontend CMS types. It does not perform network requests.

A remaining improvement for later stages is to split all domain types out of the static fallback file so that CMS domain types and fallback content are more clearly separated.

## 8. Static Fallback System

When `STRAPI_URL` or `STRAPI_API_TOKEN` is absent, `getStrapiContent()` returns static content from `getCmsContent()`.

When an individual Strapi collection fails, the current adapter logs the failure server-side and uses the fallback for that collection while preserving successful collections from the same request.

When a CMS Page request fails or returns no published record, the route continues to the existing fallback route component.

The fallback data remains important for local development, deployments without CMS credentials, and recovery from CMS outages. It should not be deleted during later migration until production CMS coverage is verified.

## 9. India and Global Handling

Current mode behavior:

- `/` selects `india`
- `/global` selects `global`
- all other routes currently select `india`
- Site settings are filtered by mode
- CMS Pages are filtered by path and mode
- Services, industries, articles, jobs, and offices do not currently have a mode field
- `getSiteMode(hostname)` exists but is unused
- `hrefFor(mode, path)` exists but is unused

The conceptual identity for pages is `(path, mode)`, but the schema currently has no database-level compound uniqueness enforcement. This was left as a documented follow-up rather than introducing custom database logic in Stage 1.

## 10. Environment and Security

Root `.env.example` documents:

- `STRAPI_URL`
- `STRAPI_API_TOKEN`
- `NEXT_PUBLIC_SITE_URL`

The root `.env.local` is ignored by Git through `.gitignore`. It must never be committed or printed. Any API token that has been shared outside the local environment should be rotated in Strapi.

CMS `.env.example` contains placeholders for:

- `HOST`
- `PORT`
- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

The Next.js token is accessed only in the server-side adapter. There is no `NEXT_PUBLIC_STRAPI_API_TOKEN` variable. The token should be read-only and scoped to the required CMS APIs.

Strapi CORS currently uses the generic `strapi::cors` middleware without an explicit production-origin configuration in the inspected file. Production deployment should restrict origins to the actual frontend domains.

## 11. Media Architecture

Current media sources are mixed:

- Static fallback data uses external image URLs, especially Unsplash URLs.
- CMS records use `imageUrl` strings.
- CMS Page components use URL string fields such as `imageUrl`.
- Local public assets exist under `public/`.
- Strapi upload support exists through the CMS, but the current content models do not use media relations for the main visual fields.

The frontend has partial media normalization through `CmsMedia` with source URL, alt text, width, and height fields. A later stage should migrate content models to Strapi Media fields and preserve a normalized frontend structure that can support responsive formats and captions.

## 12. Metadata and Sitemap

Global metadata is defined in `app/layout.tsx`. Route metadata is defined in the catch-all route using static `pageMeta` and static fallback item lookups.

The canonical site URL comes from `NEXT_PUBLIC_SITE_URL`, with a fallback of `https://igas.vercel.app` in `lib/site-url.ts`.

The sitemap in `app/sitemap.ts` is currently generated from static routes and static fallback arrays. It does not query Strapi, and CMS-created pages or records will not automatically appear in the sitemap.

These are known follow-up items, not Stage 1 migrations.

## 13. Caching and Performance

Strapi collection requests use Next.js revalidation of 60 seconds. There is no webhook or on-demand revalidation mechanism.

The route now fetches only the selected mode's content instead of loading both India and Global datasets for every request.

CMS collection requests are performed in parallel. Individual failures no longer cause successful collections to be discarded.

The CMS page request is separate from fallback content loading. A published CMS Page returns early and does not load the fallback content collections.

The frontend contains client-side interactions for navigation, search, carousel controls, reveal animations, cookie consent, and forms. The main legacy UI component remains large and is a later maintainability concern.

## 14. Error Handling

Current behavior:

- Missing CMS configuration returns fallback content.
- Non-2xx collection responses are caught per collection.
- Malformed or failed CMS page requests fall through to fallback routes.
- Server-side errors are logged with `console.error`.
- Raw CMS error details are not rendered to users.
- Missing CMS records use fallback arrays where available.

The current adapter does not distinguish all cases between 401, 403, 404, timeout, and malformed payload in user-facing telemetry. More structured operational logging can be added later.

## 15. Stage 1 Changes

The following architectural changes were made in Stage 1:

- Removed `typescript.ignoreBuildErrors` from `next.config.mjs` so production builds enforce TypeScript correctness.
- Removed global uniqueness from Page `path` so India and Global can share equivalent paths.
- Added `NEXT_PUBLIC_SITE_URL` to the root `.env.example`.
- Added independent safe loading for services, industries, articles, and site settings so one CMS outage does not erase successful collections.
- Changed the catch-all route to load only the current mode instead of both modes on every request.
- Changed service, industry, and article detail lookup to prefer normalized CMS records before static fallback records.
- Changed listing pages to use the selected mode's content.
- Added this architecture document.

No visual redesign, content migration, backend form integration, or broad page model expansion was performed as part of Stage 1.

## 16. Issues Intentionally Deferred

### Complete CMS migration

About, leadership, offices, careers, navigation, footer, contact, and newsletter remain partly or entirely static. This belongs to the next content-model stage.

### Compound page uniqueness

The schema now permits India/Global path coexistence, but exact compound uniqueness is not enforced. Add a safe lifecycle or database constraint after confirming the Strapi 5 persistence strategy.

### CMS detail content models

Services and industries currently contain summary fields only. Rich detail-page content should be modeled in a later stage.

### Jobs, offices, leadership, and navigation collections

These require product/content decisions and were intentionally not invented in Stage 1.

### Media relations

Migrate URL strings to Strapi Media fields after agreeing on upload, transformation, and CDN requirements.

### SEO model

Add page-level and entry-level SEO fields in the content migration stage.

### Forms

Contact and newsletter integrations require a destination, validation policy, spam protection, file storage decision, and privacy workflow.

### Hostname/domain mode detection

The current implementation uses `/global`. Domain-aware routing should be designed and tested before changing production URL behavior.

### Sitemap and on-demand revalidation

Connect published CMS records to sitemap generation and consider Strapi webhooks or Next.js revalidation tags after the CMS model stabilizes.

### Automated tests and linting

The repository currently has no test or lint scripts. Add focused adapter, route, and component tests once the CMS contracts settle.

## 17. Recommended Stage 2

Stage 2 should focus on controlled content migration rather than more visual work:

1. Add CMS models for jobs, offices, leadership, navigation, footer, and SEO.
2. Migrate one route at a time, beginning with About and Leadership.
3. Add typed CMS detail content for services and industries.
4. Add CMS-driven metadata and sitemap records.
5. Add a reproducible seed dataset for local development.
6. Add CMS adapter tests for empty responses, unauthorized responses, malformed records, and fallback behavior.
7. Add compound `(path, mode)` validation.
8. Keep the existing fallback pages until each route has verified CMS coverage.

## Stage 2 Addendum

Stage 2 added normalized CMS support for Jobs, Offices, Leadership profiles, Navigation items, and Footer records. It also added reusable SEO and Media components, richer Service, Industry, and Article fields, mode fields on the major content entities, Page SEO, and optional Strapi Media fields while retaining the original URL fields as compatibility fallbacks.

The adapter now normalizes these entities in `lib/strapi.ts` and returns them through `CmsContent`. The existing Careers and Offices listings use normalized CMS records when available. CMS Leadership records can render `/leadership` and `/leadership/[slug]`; CMS Office records can render `/offices/[slug]`; CMS Job records can render `/careers/[slug]`. Existing fallback arrays remain active when collections are unavailable or empty.

CMS-authored Pages now carry normalized Navigation and Footer data into the existing Header and Footer renderers. The visual presentation and interaction logic remain in React.

Page `(path, mode)` validation is implemented in `cms/src/api/page/content-types/page/lifecycles.ts`. The schema intentionally does not use a global unique constraint on `path`; the lifecycle rejects duplicate path/mode pairs.

Metadata and sitemap generation now query CMS content when server configuration is available and fall back to the static route inventory. The CMS adapter still uses a 60-second revalidation window.

An opt-in, non-destructive demo seed is available through `SEED_DEMO_CONTENT=true npm run dev:cms`. The `npm run test:stage2` command validates the Stage 2 schema contracts, adapter hooks, route hooks, Dynamic Zone support, and seed files without adding a testing framework.

Stage 2 does not complete production form integrations, domain-aware routing, Strapi Media migration for existing records, CMS navigation on every legacy fallback route, or all page content migration. Those remain explicit follow-up work.

## Stage 3 Addendum

Stage 3 adds server-only operational boundaries without changing the visual design. `/api/contact` validates names, email, message, consent, attachment size, and attachment MIME type before delivering through the optional `CONTACT_WEBHOOK_URL`. `/api/newsletter` validates email and delivers through the optional `NEWSLETTER_WEBHOOK_URL`. Both endpoints support an explicit development mode and return a safe 503 when production delivery is not configured.

## Stage 6 Acceptance Addendum

The architecture is launch-prepared but not production-accepted without external configuration. Indexing is opt-in: `ALLOW_INDEXING=true` together with an approved non-local public origin is required before robots, sitemap and page metadata allow indexing. The existing `/global` compatibility mode and fallback behavior remain active until real India/Global origins, CMS records and deployment QA are approved. See `docs/LAUNCH-READINESS.md` for the evidence-based launch decision and owners.

The existing Contact Form section is now a CMS Dynamic Zone component. CMS controls its editorial copy and consent text; the React form controls submission, validation, attachment handling, and accessibility.

The catch-all route wraps legacy fallback pages in a shared CMS chrome context. Header and Footer therefore consume normalized CMS Navigation and Footer data consistently across legacy routes, CMS Pages, directory pages, and detail pages. Static navigation/footer data remains the fallback.

Canonical URL generation now supports optional `NEXT_PUBLIC_INDIA_SITE_URL` and `NEXT_PUBLIC_GLOBAL_SITE_URL` origins. Without those variables, the existing `NEXT_PUBLIC_SITE_URL` fallback remains active. Sitemap entries use mode-aware origins, deduplicate URLs, and use CMS `updatedAt` values for `lastModified` when available.

Strapi CORS is now configured through `CORS_ORIGINS`, defaulting locally to `http://localhost:3000`. Production must provide an explicit allowed-origin list.

Stage 3 includes `npm run test:stage3`, a lightweight contract suite covering server endpoints, CMS Contact Form support, CMS chrome wiring, canonical origins, sitemap timestamps, environment placeholders, and CORS configuration. A full runtime test framework and external delivery provider remain deferred because no provider credentials or approved integration were present.
