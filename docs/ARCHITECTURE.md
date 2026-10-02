# IGAS Architecture

The site is a Next.js App Router frontend backed by Strapi 5. Strapi is the only source of business content. If API configuration is missing or a request fails, the frontend returns empty CMS structures and renders unavailable/empty states rather than bundled copy, profiles, vacancies, navigation, or collection records.

## Content flow

```text
Strapi REST API
  -> lib/strapi.ts (published records, normalization, request errors)
  -> lib/cms-content.ts (frontend content types and empty state)
  -> route metadata, page builder, collection listings, and site chrome
```

`app/[[...slug]]/page.tsx` resolves the active site mode, loads CMS page/content data, gives published page-builder records precedence, routes published collection records, and returns not-found/unavailable states for missing content. `/global` and hostname-based mode selection only use the Global dataset when configured.

`components/cms-page.tsx` renders the Page Dynamic Zone: Hero, Rich Text, Image and Text, Stats, Quote Banner, Carousel, CTA, Contact Form, and Collection Listing. Collection Listing reads published services, industries, articles, open jobs, offices, or leadership records from the same CMS payload as directory routes.

`components/igas-site.tsx` contains shared layout and collection/detail views. Navigation, footer, cookie consent, and homepage/page copy are supplied by Strapi. Cookie consent is hidden unless enabled and configured. Search queries published Strapi pages and collections through `/api/search`.

## Strapi model

Strapi collection types include Pages, Services, Industries, Articles, Jobs, Offices, Leadership Profiles, Site Settings, Navigation Items, and Footers. Shared components provide section layouts, media, SEO, stats, quotes, footer columns, and cookie consent. Keep generated declarations in `cms/types/generated/` aligned with schema changes.

## SEO and routes

Page and collection SEO values take precedence over mode-specific Site Setting defaults. Missing CMS SEO uses neutral technical metadata. The sitemap includes published CMS page paths and collection routes with published records; indexing is opt-in via deployment configuration. Canonical origins are configured with `NEXT_PUBLIC_SITE_URL` and optional India/Global origins.

## Configuration and operations

The frontend needs `STRAPI_URL` and `STRAPI_API_TOKEN` to read CMS data. Missing credentials, request timeouts, and Strapi errors are logged server-side and surfaced in the page/search empty or error states. Contact/newsletter/revalidation endpoints have separate provider and secret configuration documented in `.env.example`.

See [CONTENT-MIGRATION-MATRIX.md](CONTENT-MIGRATION-MATRIX.md) for which records and approved copy still need to be populated.
