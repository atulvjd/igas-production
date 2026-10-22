# IGAS website architecture

This file describes the current CMS integration. Stage reports below this document in `docs/` are historical records of earlier stages and may describe an implementation that has since changed. See [CMS integration status](CMS-INTEGRATION-STATUS.md) for field-by-field collection mappings, live record counts, route checks, and outstanding verification limits.

## Runtime data flow

```text
Published Strapi records
  -> server-only REST adapter (`lib/strapi.ts`)
  -> normalized `CmsContent` (`lib/cms-content.ts`)
  -> existing route components and shared Header/Footer
```

`STRAPI_URL` and `STRAPI_API_TOKEN` are read only by the server adapter. Requests use Strapi's published-content behavior, populate required relations/media, filter records by site mode (including older records with no mode), and tag CMS fetches with `strapi-content`. Collection records are normalized to empty arrays on request failure and logged server-side; the frontend never restores old mock business records. Type definitions in `lib/igas-data.ts` do not contain a fallback dataset.

## Routes and page composition

`app/[[...slug]]/page.tsx` resolves mode, loads CMS content and renders the existing page components for home/global home, About, Contact, Services, Industries, Articles/Latest thinking, Careers, Offices, Leadership, and detail routes. A published Page Builder record is used only for custom paths; known built-in routes continue to use their established React layouts. Unknown collection slugs return 404. Both `/articles/[slug]` and `/latest-thinking/[slug]` resolve the same Article records.

The public route layout stays in the existing components:

- `components/igas-site.tsx`: Header, home, About, collection listings, detail pages, footer, search and cookie banner.
- `components/contact-page.tsx`: Contact content and client form; form submission/validation stays in Next.js.
- `components/cms-directory-pages.tsx`: Job, Office and Leadership listing/detail components.
- `components/cms-page.tsx`: ordered Page Builder dynamic-zone renderers.

## CMS data coverage

`lib/strapi.ts` requests Services, Industries, Articles, Focus areas, Jobs, Offices, Leadership profiles, Navigation items, Footers, Site settings, and Pages. It normalizes Strapi media URLs to absolute URLs, maps relations to public slugs/titles, retains ordering, excludes hidden navigation items and non-open jobs, and adapts SEO fields to Next.js metadata. The full attribute-to-component mapping and current unverified areas are in `CMS-INTEGRATION-STATUS.md`.

The current Page Builder dynamic zone registers Hero, Rich text, Image and text, Stats, Carousel, CTA, Contact form and Quote components. Each renderer uses the existing site's styles and follows the Page section order. Media is normalized and rendered for CMS Page sections, Article cards/details, Service/Industry details, leadership, offices, and Site setting imagery.

Strapi Users and Users & Permissions accounts are administrator/authentication identities. They are not public content and are not requested by the frontend.

## Cache and updates

CMS reads use a 60-second revalidation window and the `strapi-content` cache tag. `POST /api/revalidate` requires `Authorization: Bearer <REVALIDATION_SECRET>`, expires that tag immediately, revalidates the catch-all route and refreshes the sitemap. The Strapi lifecycle webhook is configured in `cms/src/index.ts` to call that route after content changes when its server configuration is present. Draft records remain unavailable through the published API; update, unpublish and delete propagation still require end-to-end verification with a write-enabled CMS test environment.

## Forms

Contact and newsletter forms submit to Next.js API routes. Provider delivery configuration is server-only. CMS controls the displayed contact, consent, success and newsletter text; the form logic remains in the frontend.

## Empty and error behavior

An empty collection renders the existing empty state or hides an optional section. Unknown detail slugs return 404. Failed CMS collection reads are logged and treated as empty; there is no user-facing distinction between an empty collection and an upstream read failure. Neither case shows stale business records. Technical UI labels, brand assets and metadata defaults are retained where necessary.

## Current readiness behavior

Production builds require `NEXT_PUBLIC_SITE_URL` to be an approved HTTPS origin; there is no production fallback domain. India/Global-specific origins are optional for a shared-domain setup and must be configured together to enable hostname routing.

Sitemaps include implemented built-in routes, published collection entries, and valid published custom Page paths. Reserved built-in route families cannot be shadowed by Page Builder records. The `/articles` alias canonicalizes to `/latest-thinking` and is omitted from the sitemap. With separate India/Global origins, each mode gets its own origin; otherwise the sitemap includes shared India routes and the `/global` homepage alias.

Contact consent is required by the API and the frontend always renders the required checkbox, using the CMS label when supplied and the existing IGAS enquiry-consent wording otherwise. Both forms have bounded request sizes, server-side validation, per-process rate limiting, safe error responses and recoverable client submission states.

The `igas-consent` preference is first-party and persisted for one year. Vercel Analytics is not mounted until analytics is allowed; its event hook also blocks events after the user withdraws that choice. This is a technical implementation, not a legal determination. Product/legal owners must approve applicable wording and behavior; marketing analytics is not connected.

Contact attachments are checked for declared MIME type, extension and size and are not publicly served. The generic adapter sends bytes only when explicitly enabled for an approved webhook. Private long-term storage, malware scanning and retention/deletion controls still depend on an external provider.
