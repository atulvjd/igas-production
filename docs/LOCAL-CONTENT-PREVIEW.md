# Local CMS content preview

## Interaction refinement — 24 October 2026

Shared controls now have coordinated hover, press, focus and selected-state feedback. Clickable cards use a small lift and gentle image scaling on fine-pointer devices; card dimensions and image/text boundaries stay unchanged. Menus and filtered article results use short entry effects. Contact/newsletter buttons show a disabled loading state and a spinner while a request is pending, with busy states exposed to assistive technology.

`components/site-interactions.tsx` progressively enhances below-the-fold sections with a short reveal on entry, reinitialises for route changes and responds to live reduced-motion changes. The initial viewport is never hidden by this enhancement. Focus or fragment navigation reveals its target, cleanup removes pending classes, and policy pages are excluded. Reduced-motion preferences disable transitions, movement and spinner animation while keeping state feedback visible. CMS content and schemas are unchanged.

Local browser checks passed for hover/press feedback, scroll entry, stable card geometry, live reduced-motion changes, loading/error recovery, mobile navigation, category filtering and policy-page visibility. Newsletter responses were intercepted for testing; no real subscription was sent. TypeScript, CSS compilation and whitespace checks passed.

## Editorial expansion and policy publication — 24 October 2026

The local CMS now contains 17 published articles (12 new), 12 industries (seven new sectors listed in the supplied firm profile), and six focus-area groups. New original articles cover audit readiness, tax records, cash-flow visibility, internal controls, forensic concerns, transaction preparation, transformation, management reporting, manufacturing inventory, reporting data, healthcare business operations and strategy. Ten topic categories organise the articles; service, industry and related-reading relationships are connected. Each new article includes five substantive sections and a short practical takeaway list. Existing article bodies were retained, and their broad categories were normalised where appropriate.

All eight services received additional practical scope/preparation content. Existing industries gained more detail, while the new industry records include editable editorial images, descriptions, body content and service links. Focus-area descriptions and sector relationships were expanded without changing their CMS schema.

The four former policy placeholders — Privacy Policy, Cookie Policy, Terms of Use and Disclaimer — were replaced with complete copy and published in both India and Global modes. Four compact footer links expose them without adding a duplicate Legal navigation column. Policy text describes the implemented forms, optional attachment handling, local search, preference cookie, consent-gated production analytics and external editorial-image requests. Cookie/analytics wording was checked against the implementation and [Vercel's analytics privacy documentation](https://vercel.com/docs/analytics/privacy-policy); [MeitY's publication](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025) was consulted as legal context. No universal compliance certification, invented registration details, named privacy officer, fixed enquiry-retention period or unverified statutory commencement date is claimed. Policies use the firm-profile contact details. Website contact/newsletter delivery remains unconfigured; publishing policy pages does not enable delivery.

Repeatable source: `scripts/expand-editorial-content.mjs` with copy in `scripts/content/editorial-expansion.mjs` and `scripts/content/website-policies.mjs`. Ignored before snapshots and change journals are retained in `cms/.tmp/editorial-expansion-*/`; the follow-up takeaway insertion also retained a snapshot in `cms/.tmp/article-takeaways-*/`. All content remains editable in Strapi.

Checks passed for 26 frontend routes, published policy records in both modes, new article categories/bodies/relationships, frontend TypeScript and existing article-formatting checks. Browser checks verified all 17 articles, ten category filters, category selection, six focus groups, four footer policy links, and no horizontal overflow at 390, 768 and 1440 pixels on the listing, industry and four policy pages. These are local CMS publications; no production deployment was performed. This update supersedes the historical draft-policy status described below.

## Search update — 24 October 2026

Search now opens near the top, with a focused 16px input, CMS-derived service/industry suggestions and four quick navigation links. Results include their content category and a short description, with title matches ranked first. The input stays above an independently scrolling results area. Visual Viewport resize/scroll events keep the panel within the visible area when a mobile keyboard reduces it. Existing CMS search labels and placeholder fields remain in use; no new CMS fields are required.

Local browser checks passed for autofocus, five suggestions, live tax results, Arrow Down to the first result, clearing and refocusing, no-match guidance, Escape/focus restoration, suggestion navigation and top positioning on desktop/mobile. A reduced mobile viewport check passed; physical-device keyboard behavior was not tested. Screenshots were inspected, and frontend TypeScript and CSS compilation passed.

## Compact footer and additional imagery — 24 October 2026

The footer now omits the large quote/CTA band, industry directory column and full office-address panels. It retains the logo, shorter firm line, contact email, city links, five general links, four service links plus “All services”, a compact newsletter and the copyright/social row. Both CMS footer records now contain the shorter copy and link selection.

Eight published services and both offices now have editorial image URLs and descriptive alt text in the CMS. Services gained optional `imageUrl` and `imageAlt` fields alongside their existing uploaded `heroImage`; uploaded media remains preferred. Image rendering now covers homepage service cards, service listings/details, industry directory cards, About, office listings/details and careers. Images reuse existing editorial sources, with office images explicitly described as illustrations rather than photographs of IGAS premises. No stock portraits were assigned to leadership profiles.

Repeatable script: `scripts/refine-footer-and-images.mjs`; ignored before snapshots and journals are in `cms/.tmp/footer-images-*/`. All 12 CMS updates were read back through the published API. Frontend/CMS TypeScript and CSS compilation passed; seven affected routes rendered the expected images and compact footer. Browser checks found no horizontal overflow at 390, 768 and 1440 pixels; the desktop footer measured 490 pixels tall. Service-card and footer screenshots were inspected locally.

## Presentation update — 24 October 2026

The reference-inspired presentation uses a split hero, service cards, image-led industry cards, compact statistics, rounded story and careers panels, and a green newsletter panel. The four signature hues and transparent vector logo remain in use. The existing contact form, article carousel, navigation, routes and CMS field definitions are retained. Homepage industries now link directly to each published industry's detail page; focus-area groupings remain available in navigation and the industry directory.

`scripts/add-presentation-images.mjs` fills only empty hero, About and careers image URL fields using editorial photographs already stored on published CMS articles. Both modes retain their own editable fields. Before snapshots are stored in ignored `cms/.tmp/presentation-images-*/` folders. No image or design from the reference sites was copied into the project.

Local checks: frontend TypeScript, PostCSS/Tailwind compilation, six HTTP route checks, and browser layout checks at 390, 768, 1024 and 1440 pixels passed. Screenshots were inspected for the desktop/mobile hero, industry cards and mobile contact page. The contact form retains its four required fields; submissions were not sent during visual QA. CMS record updates were read back from the published API. This remains a local preview, not a production deployment.

## Firm profile update — 24 October 2026

The user-supplied `IGAS International - Top firm profile - Bangalore.pdf` now informs the homepage, About, approach, careers introduction, contact, navigation and footer copy in the local CMS. Purpose, mission, vision, values, partner involvement and social responsibility are adapted from pages 5–6, 10, 17–18. Template instructions, internal SWOT material and unverified superlatives were excluded.

Homepage and approach statistics use the profile's 31 offices, 19 cities, 400+ employees, 38 founding partners and 40+ years of team/partner experience. These are explicitly profile-sourced figures, not independently verified current counts; team experience is not presented as the firm's age. Deals, Forensic and Strategy were added to the existing services directory. Existing service bodies were retained with a short profile-based approach section; the five industry pages gained sector context, and Healthcare now includes Pharma.

The illustrative office was replaced with the Mumbai corporate office, and the Bengaluru branch was added using the addresses on page 19. Displayed contact email now uses `Mohan@caigas.in` from that page. This updates public content, not backend email delivery configuration. Demo leadership and demo job records remain unchanged because the profile does not supply named leaders or current vacancies.

Repeatable update: `scripts/apply-firm-profile.mjs`. Its ignored `cms/.tmp/firm-profile-*/` directories retain before snapshots and change journals; the earliest snapshot preserves the state before this update. Successful final run verified 17 CMS writes, followed by a successful website cache refresh. Ten local website routes returned HTTP 200 and contained the expected profile copy, including all three new service pages and both offices. No production deployment is claimed.

## Earlier content fill

Updated 22 October 2026. These changes are in the local SQLite CMS and do not constitute a production deployment.

## Published content

| Collection | Records | Preview coverage |
| --- | ---: | --- |
| Services | 5 | Missing service descriptions and bodies completed; SEO and related content connected. Existing substantive copy retained. |
| Industries | 5 | Existing copy retained; SEO, alt text and related content connected. |
| Articles | 5 | Existing articles retained; category typo corrected, SEO and related links added. |
| Focus areas | 3 | Finance & enterprise, Innovation & creative business, Essential industries. All five industries are grouped. |
| Jobs | 2 | Clearly labelled demo roles, with role sections and demo application destinations. |
| Offices | 1 | Clearly labelled demo India office; no invented street address, telephone or coordinates. |
| Leadership profiles | 2 | Clearly labelled demo advisory and assurance profiles, without invented personal identities or qualifications. |
| Navigation items | 8 | Header CTA and Who we are groups connected to working routes. |
| Footers | 2 | India and Global; India links expanded, placeholder phone removed and unpublished policy links hidden. |
| Site settings | 2 | India and Global copy; India contact fields, editorial imagery, CTAs, search and consent labels filled. |
| Pages | 2 | `/our-approach` (all eight section types) and `/working-with-igas` (three sections). |

The homepage statistics describe the actual five published services, five industries and five insights. They are not claims about clients, team size, offices or business results. Images reuse editorial image URLs already stored in this CMS. No new identity or administrator accounts were created.

Four additional Pages are draft-only editorial placeholders: Privacy Policy, Terms of Use, Disclaimer and Cookie Policy. Their instructions must be replaced with approved text before publication. The demo jobs, office and leadership records must also be replaced or removed before production.

## Backups and repeatable script

The original pre-fill SQLite backup is `cms/.tmp/before-content-fill-20261022-225934.db`. The original API content snapshot is `cms/.tmp/content-fill-2026-10-22T17-29-38-014Z/before.json`. Subsequent runs retained their own snapshots and change journals in the same ignored directory. Backups contain private CMS configuration/data and should remain local.

`scripts/populate-local-cms.mjs` contains the preview content and restricts writes to localhost. It uses the separate ignored editing credential. Do not rerun after replacing demo content without reviewing the script: matching demo records, relationships and some presentation fields will be refreshed. Restore a database backup only with Strapi stopped and after preserving any newer content.

## Publishing fix and verification

Page path validation now treats the draft and published rows of the same Strapi document as one page. Distinct documents cannot use the same path/mode; partial path updates also check for collisions. Regression checks run with `node scripts/test-page-lifecycle.mjs`.

Published collection reads and 12 public preview routes returned HTTP 200. The unpublished `/privacy-policy` returned 404. The custom approach page rendered rich text, statistics, carousel and contact sections. Frontend/CMS TypeScript, existing contract/readiness checks and whitespace checks passed. No production provider delivery or deployed browser/device acceptance is claimed.
