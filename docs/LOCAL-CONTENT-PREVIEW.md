## Public email placeholder — 25 October 2026

All public contact addresses in Site settings, Footer, Offices and custom/policy Page content now use `example@example.10.com`, including India and Global published/draft versions. The contact input placeholder and content-population templates use the same address. The original firm-profile address was replaced at the user’s request. CMS administrator identities and backend delivery configuration are outside this content change. Before snapshots are retained under `cms/.tmp/placeholder-email-*/`.

## Contrast repair — 25 October 2026

The About hero retained white/pale-pink text from its earlier dark-green treatment after its surface changed to pale green. Its source rules now use navy foreground and the shared muted text colour. The same review found dark CTA body text on the navy Our Approach and Working with IGAS panels: the theme selector incorrectly targeted a descendant instead of the CTA element itself. The corrected selector supports dark/accent CTA themes. Footer copyright/policy text also uses the darker shared muted colour.

Validation: nineteen representative routes were checked at 1440 and 390 pixels. The solid-background text scan found no remaining failures against 4.5:1 for normal text and 3:1 for large text; image/gradient backgrounds were excluded from that automated measurement. About screenshots were inspected, responsive overflow checks passed, and CMS/footer integration requests succeeded. This was a targeted regression check, not a complete accessibility audit.

Both local servers were running and CMS/footer requests succeeded; the terminal termination message shown in the screenshot referred to the earlier controlled CMS restart. No database or content changes were needed for these colour corrections.

## Unique image assignment — 25 October 2026

Published 71 independent photo assignments across India/Global presentation settings, eight services, twelve industries, seventeen articles, two offices, six focus areas, two illustrative leadership contexts and eight custom-page image slots. Distinct content and section slots no longer reuse generic photographs. Mumbai/Bengaluru use different city images. Home, About, Contact and Careers now have separate optional CMS image fields; homepage presence/leadership panels and focus areas also have their own photos. Media Library uploads remain preferred where the existing components support them.

The CMS was stopped before the additive schema edits, with an online SQLite backup retained. It restarted using the installed Node 24 runtime matching the SQLite binary. API snapshots/journals are under `cms/.tmp/unique-images-*/`. Sources, editing guidance and the repeatable assignment/verification scripts are documented in `docs/IMAGE-INVENTORY.md`.

Fresh checks verified all 71 sources available and distinct by source identity and preview bytes; 59 rendered routes had no repeated photograph within main content. All 17 article bodies and footer links remained intact. Frontend/CMS TypeScript and rich-text checks passed. A snapshot comparison preserved non-image copy and counts for 59 published records. Browser checks on eleven main page types at 320, 390, 768 and 1440 pixels found no horizontal overflow or collapsed image frames; desktop/mobile screenshots were inspected.

## Social icons and hover feedback — 25 October 2026

The footer's right column uses accessible SVG marks for the CMS LinkedIn, Instagram and X links, with Privacy Policy, Cookie Policy, Terms of Use and Disclaimer directly beneath them. Unknown future social destinations use a generic website icon. The links remain CMS-controlled; no social URLs were replaced.

Content cards and selected panels now lift by 2 pixels with a soft shadow on precise-pointer hover. Reduced-motion preferences suppress movement, and transforms leave the layout dimensions unchanged. The homepage Latest Thinking carousel now advances every 2 seconds instead of the original 5, with a 380 ms slide transition instead of 700 ms. Existing hover/focus/visibility/pause conditions remain in use.

Validation: TypeScript, diff checks and the live footer integration check passed. Browser checks verified SVG accessibility labels, four policy links, actual carousel advance, Pause, immediate Next, hover feedback without layout-width changes, reduced-motion overrides, and no horizontal overflow at 320, 390, 768 and 1440 pixels. The final footer screenshot was inspected.

## Office interaction and directory card repair — 24 October 2026

The office directory now uses independent bordered cards with a proper gap and transparent grid background; it no longer leaves a grey padding band underneath the cards. Address text and actions flow naturally, without an absolutely positioned arrow overlapping long addresses. City filters, result counts, directions, copy-address feedback and office-detail links use the existing published CMS office records. Email and phone actions appear only when those fields exist. Directions use supplied coordinates when available, otherwise the full CMS street address; no geocoding or embedded third-party map is required. Existing editorial office images remain editable in the CMS.

The same reusable office actions appear on contact-page office cards and individual office pages. Other directory cards now clip images to their rounded corners and reserve bottom space for arrows, including industry/focus cards and shared related/leadership cards. No CMS schema or record changes are required.

Validation: frontend TypeScript and diff checks passed. Browser checks at 320, 390, 768 and 1440 pixels verified office-card gaps, transparent grid background, action/address separation, both city filters, directions URLs, and overflow/arrow clearance across offices, industry, service, leadership, contact and both office-detail pages. Address copying and denied-clipboard guidance passed; office images loaded visibly on desktop and mobile. No directions link or email action was submitted during checks.

## Homepage and contact refinement — 24 October 2026

The homepage now places Latest Thinking immediately after A Point of View. It shows the first six published industries in CMS `sortOrder`, with a link to the full industry directory. Change industry order in the CMS to change the selection; all 12 remain published and accessible. The hero retains the recovered profile-based copy, image and calls to action, with direct links to the published audit, tax and advisory services where available.

The footer request now explicitly populates each relation/component: Strapi rejects mixing wildcard population with a nested population object, which had caused the frontend to fall back to basic footer content. The footer again includes office addresses and a short industry directory, alongside the expanded firm description, services, newsletter and policies. The homepage has a contact invitation using Site settings. The contact page now has a grouped form, attachment guidance, privacy link, direct email card and published office cards. Existing submission behavior is retained; delivery still requires the configured contact webhook.

CMS editing: hero and contact copy are under Site settings for each mode; firm description is under Footer → Signature; office names/addresses are under Offices. The `scripts/refine-home-and-contact.mjs` update uses existing fields, backs up both draft and published records, and verifies publication. Its snapshots are under ignored `cms/.tmp/home-contact-*/`. Content remains local CMS data, separately from Git-tracked source.

Validation: frontend TypeScript and all 19 readiness checks passed. Browser checks passed at 320, 390, 768 and 1440 pixels for hero copy, section order, six selected industries, footer content, contact controls and no horizontal overflow. A simulated contact failure stayed aligned above the submit button and allowed retry. `scripts/check-live-footer.mjs` verified the actual CMS signature and links on `/`, `/contact`, `/our-approach` and `/global`. Screenshots were inspected; no live enquiry was sent.

Before any future Git checkout/rebase that changes CMS schemas, stop the CMS and take a SQLite online backup. Running the development server while loading an older schema can remove database columns even if the final schema later restores them. Existing recovery snapshots and database backups must be retained.

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

The illustrative office was replaced with the Mumbai corporate office, and the Bengaluru branch was added using the addresses on page 19. Displayed contact email now uses `example@example.10.com` from that page. This updates public content, not backend email delivery configuration. Demo leadership and demo job records remain unchanged because the profile does not supply named leaders or current vacancies.

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
