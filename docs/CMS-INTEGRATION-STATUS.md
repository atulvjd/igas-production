# IGAS CMS integration status

## Current architecture

Strapi is the only source of published business records. `lib/strapi.ts` reads published records with a server-only bearer token, normalizes relations and media, and passes `CmsContent` into the existing page components. `lib/igas-data.ts` now contains shared TypeScript contracts only. Empty or failed collections do not fall back to mock business records; optional sections hide and listings show their existing empty states. Errors are logged server-side; the UI does not currently distinguish an upstream error from an empty collection.

The shared `strapi-content` cache tag is invalidated by the authenticated `/api/revalidate` route and the Strapi lifecycle webhook. Fetches also revalidate after 60 seconds. Draft records are excluded by Strapi's published REST behavior. Built-in routes retain their existing React layouts; Page Builder records control custom paths, while built-in path matches do not replace those layouts.

## Collection-to-UI mapping

| Collection and fields | Adapter and existing UI placement | Public route / state |
| --- | --- | --- |
| **Article**: title, slug, excerpt, category, date/publicationDate, image URL/alt or featured image, content, author, content type, featured, related articles/services/industries, mode, SEO | `normalizeArticle` in `lib/strapi.ts`; title, excerpt, category, date and image populate the existing home carousel, article cards and detail hero/body. Relations populate related cards. Published records are in search and metadata. Author appears as a byline on detail pages when present; `contentType` remains normalized but is not shown because the existing editorial layout uses category/date rather than content-format labels. | `/articles`, `/articles/[slug]`, `/latest-thinking`, `/latest-thinking/[slug]`; `/articles` aliases canonicalize to `/latest-thinking`, and only the canonical route family is included in the sitemap. Empty list state. |
| **Focus area**: title, slug, description, industries relation, mode, sort order | `CmsFocusArea`; desktop “Where we focus” menu, its mobile links, and industry listing groups. Related Industry links retain the existing industry detail destination. | Menu and `/industries`; empty groups disappear and ungrouped industries remain listed. |
| **Footer**: mode, quote/author/signature, contact email/phone, newsletter title/description, copyright, useful/legal/social links | `normalizeFooter`; existing quote, newsletter, link columns, contact details and bottom row. Footer `external` links open externally. Footer-type Navigation items can supply grouped footer links. | Site-wide footer. No separate route. |
| **Industry**: title, slug, description/short description, full content, image URL/alt or hero image, related services/articles, mode, SEO, order | Existing listing cards, detail heading/body, related cards, search and metadata. Normalized hero media is rendered in the existing detail hero. | `/industries`, `/industries/[slug]`; empty listing state and 404 for an unknown slug. |
| **Job**: title, slug, short description, description, responsibilities, qualifications, requirements, benefits, department, employment type, location, office relation, application CTA/URL, application status, deadline, order, mode, SEO | Open jobs only are normalized; existing careers rows and job detail sections/application link. Paused and closed jobs are excluded. Office relation resolves its slug; office detail link and deadline are shown when present. | `/careers`, `/careers/[slug]`; no-open-roles state. |
| **Leadership profile**: name, slug, position, biography, profile media, email, LinkedIn URL, related services/industries, order, mode, SEO | Existing leadership cards, home presence panel, detail image/biography/contact/social/related links. | `/leadership`, `/leadership/[slug]`; empty state and 404 when absent. |
| **Navigation item**: label, href, group, parent group, description, menu type, external, CTA, visible, mode, order | Header records feed the existing mega menus and CTA; mobile records feed the mobile menu; footer records feed grouped footer columns. Visibility, mode, order, parent grouping and external-link behavior are applied. | Shared site chrome on built-in and Page Builder routes. |
| **Office**: name, slug, city, country, address, phone, email, description, image URL/alt or image, latitude/longitude, services relation, mode, order, SEO | Existing office listing and detail page; detail displays image, contact links, coordinate-based map link and related services. | `/offices`, `/offices/[slug]`; empty state and 404 when absent. |
| **Page**: path, mode, title, description, SEO, dynamic-zone sections | `getStrapiPage` resolves the exact path and mode. CMS page chrome uses CMS navigation/footer; section renderers preserve the configured component order. | Published custom CMS paths only. Known built-in routes are reserved for their existing React components. |
| **Service**: title, slug, description/short description, full content, tag, hero media, related industries/articles/leadership, mode, SEO, order | Existing homepage links, service listing cards, detail hero/body and related cards; hero media renders in the detail hero. Published records are in search and metadata. | `/services`, `/services/[slug]`; empty state and 404 when absent. |
| **Site setting**: mode; hero copy/CTA/image; statement copy/CTA/statistics; about copy/CTA/image; presence and careers copy/image; logos; contact CTA/search text; contact copy/consent/success; cookie labels/copy; newsletter title/footer signature/contact; mega-menu components; SEO | `mergeSettings` plus media and statistics normalizers; existing home hero, statistics, About page, Careers/Offices headings, header/footer, Contact page, cookie banner, metadata. `shared.stat-item` active/order/suffix controls home stat output. | India/Global layouts use their matching record. Without a published setting, editable business text remains blank and optional parts hide. |
| **User**: Strapi admin/users-permissions identities | Not requested from public content endpoints and not passed to the website. Authentication identity and account data are private CMS administration data, not public site content. | No public route by design. |

### Site Setting field coverage

All fields defined in `cms/src/api/site-setting/content-types/site-setting/schema.json` are connected: hero eyebrow/title/intro/CTA/URL/URL image/media; statement title/intro/CTA/URL and repeatable statistics; about title/text/CTA/URL/URL image/media; presence title/text; careers title/text/URL image/media; India/global logos; contact CTA label/URL; search label/placeholder; contact eyebrow/title/intro/consent/success/email/phone; cookie title/description and accept/reject/manage/essential/analytics/marketing labels; newsletter title; footer signature; repeatable mega-menu content; and SEO. The cookie choice handling remains in the existing client UI; CMS supplies its text.

## Page Builder components

| Strapi component | Fields consumed | Renderer and location |
| --- | --- | --- |
| `shared.hero` | eyebrow, title, intro, CTA label/URL, image URL/media | `Section` in `components/cms-page.tsx`; full-width hero section. |
| `shared.rich-text` | eyebrow, title, blocks body, theme | `RichText`; themed narrow content section. |
| `shared.image-text` | eyebrow, title, body, image URL/alt/media, image side, CTA | Existing two-column image/text section; honors left/right image placement. |
| `shared.stats` / `shared.stat-item` | eyebrow, title, intro, value, suffix, label, detail, active, sort order | Ordered stats grid; inactive items are hidden. |
| `shared.quote` | eyebrow, quote, author, signature | Quote section using existing footer-quote styling. |
| `shared.carousel` / `shared.carousel-slide` | eyebrow, title, title/category/date/excerpt, image URL/alt/media, href | Existing carousel UI with next/previous controls. |
| `shared.cta` | eyebrow, title, body, label, URL, theme | Themed CTA section. |
| `shared.contact-form` | eyebrow, title, intro, contact email/phone, consent and success text | Existing contact layout and Next.js form submission/validation. |

The Page schema currently permits these components. It does not define separate Service/Industry/Article/Focus-area listing components; collection listings remain in the existing route components.

## Route and live verification

A local production build was served and these existing routes returned HTTP 200: `/`, `/global`, `/about`, `/contact`, `/services`, `/services/advisory-consulting`, `/industries`, `/industries/manufacturing`, `/articles`, `/articles/rethinking-risk-connected-world`, `/latest-thinking`, `/careers`, `/offices`, `/leadership`, and `/sitemap.xml`. `/careers/sample` returned 404 as expected for an absent job. The route sample confirms Service, Industry, and Article detail lookups and both article aliases. No published CMS Pages were available to verify custom routes.

Historical read-only, published-only Strapi snapshot (not rechecked in this QA run) returned 5 Services, 5 Industries, 5 Articles, and 0 records for Focus areas, Footers, Jobs, Leadership profiles, Navigation items, Offices, Pages, and Site settings. All five Service and Industry records had titles but no non-empty `description` or `shortDescription`; all five Articles had a title, excerpt and body. The existing Service, Industry and Article records did not specify a mode and were shared by the adapter's India/Global mode filter. Therefore successful detail-route HTTP responses do not mean the live Service/Industry copy is complete.

The requested change → publish → frontend → restore checks could not be completed. The configured API token allows reads but Strapi returned HTTP 403 for the first publish/update request on an existing Service; the check stopped before changing a record. Because there are no published records in the other collections, those checks are also unavailable. Draft/unpublish/delete propagation has not been exercised against a write-enabled test environment.

## Remaining limits

- Obtain a temporary editor/write token or a controlled CMS test environment to run reversible publish/update/restore checks for each populated collection and populate safe QA records for currently empty collections.
- Verify published/draft/unpublish/delete changes end-to-end, plus live CMS image assets and custom Page Builder routes.
- Article `contentType` is normalized but not displayed in the current article UI; category/date remain the visible content classification in the existing design.
- No schema fields currently exist for a hero video/background overlay or image fields on Navigation items; those cannot be populated from the inspected Strapi model.
- Empty or upstream-failed collections use the same empty state. The failure is logged on the server, and no stale records are shown.
- Technical presentation defaults remain for menu group labels, route URLs, metadata fallback, accessibility/UI text, and the local IGAS brand image. These are not mock business records.
