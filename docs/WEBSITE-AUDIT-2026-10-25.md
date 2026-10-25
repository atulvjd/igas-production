**IGAS website — detailed status, remaining work and improvement report**

Prepared: 25 October 2026 · Asia/Kolkata. Scope: the current local repository, running local Next.js website, local Strapi CMS, configuration flags, published content, available tests and evidence from the recent browser checks.

**The website has a substantial working design and CMS implementation, but it is not yet a verified production-ready business system.** Its main remaining needs are enquiry delivery, newsletter integration, production configuration, approved people/careers content, reliable content deployment and operational ownership. More animation is a lower priority than making sure a visitor's enquiry actually reaches the firm.

This audit did not deploy the website, change CMS records, submit an external enquiry, send an email, verify social-account ownership or perform a penetration test. Production infrastructure outside this workspace may exist; its current configuration and behavior were not available for acceptance testing. Findings described as unconfigured refer to the inspected local environment unless stated otherwise.

> Subsequent implementation update, 25 October 2026: the policy links were moved beside the footer copyright, and the image review replaced duplicated imagery with 71 distinct CMS photograph assignments. See `IMAGE-INVENTORY.md` for the current mapping. The image repetition findings below describe the earlier audit snapshot; delivery, production and handover findings still require their own acceptance checks.

**1. Overall condition and what the status means**

| Area | Current assessment | Meaning |
| --- | --- | --- |
| Visual identity and core presentation | Implemented, with local QA | Signature colours, transparent vector logo, responsive components and polished article/office layouts exist. |
| India content coverage | Substantial | Services, industries, insights, offices and policy records are published locally. |
| CMS editing | Working locally | The site reads published Strapi records; editorial fields and repeatable components are in use. |
| Contact form | UI and validation implemented; delivery unconfigured locally | A visible form does not yet prove receipt by the firm. |
| Newsletter | UI and validation implemented; delivery unconfigured locally | A subscription provider and subscriber lifecycle are still required. |
| Global version | Partially populated | Separate settings and policies exist, but content allocation differs materially from India. |
| Production build | Passed in this audit | The current default Next.js build succeeds with an explicitly supplied reserved test origin. |
| Production launch | Not accepted | Domains, deployment controls, data migration, real delivery, backups and production QA remain to be evidenced. |
| Documentation and handover | Inconsistent | Older reports describe earlier content/build states; the Stage 6 handover check currently fails. |

I have not assigned an arbitrary completion percentage. Visual completion, content approval and operational readiness are different measures, and a percentage would conceal the remaining launch dependencies.

**2. What is already built**

The frontend uses Next.js 16.3.3 and React 19; the CMS package uses Strapi 5.53.0. SQLite is the current local database. Next.js reads CMS content on the server using a configured token and passes the necessary content into shared site components. Published collection records drive listings and detail pages. A CMS Page Builder supports custom pages using sections such as hero, rich text, image/text, statistics, quote, collection listing, carousel, CTA and contact form.

The built-in routes include Home, Global, About, Leadership, Contact, Services, Industries, Latest Thinking, Careers and Offices. Detail routes exist for published services, industries, articles, jobs, offices and leadership records. `/articles` is retained as an alias, while `/latest-thinking` is the intended canonical article area. Additional CMS-driven pages include Our Approach and Working with IGAS, plus the policy pages.

The visual system uses red `#DA4141`, green `#00674F`, navy `#172F5D` and yellow `#FFD700`. The header stripe follows the requested red → green → navy → yellow order. The main wordmark is a transparent local vector asset, with responsive sizing in the header and footer. Rounded image panels, consistent page containers and restrained interaction feedback have replaced several earlier spacing and clipping problems.

**3. Current published CMS inventory**

These counts were read from the local CMS during this audit, rather than copied from earlier reports.

| Collection | Published documents | Important qualification |
| --- | ---: | --- |
| Site settings | 2 | India and Global; both have hero copy, imagery, five statistics and five menu definitions. |
| Services | 8 | Five India-specific and three shared records. All eight have image fields populated. |
| Industries | 12 | All currently assigned to India; all have image fields populated. |
| Articles | 17 | All currently shared across modes; all have images and related-article relationships. |
| Focus areas | 6 | All currently assigned to India. |
| Offices | 2 | Mumbai and Bengaluru; India-specific records with addresses and illustrative imagery. |
| Jobs | 2 | Both published records are explicitly labelled demo roles. |
| Leadership profiles | 2 | Both published records are explicitly labelled demo profiles. |
| Navigation items | 8 | India-specific records. |
| Footer records | 2 | India and Global; both have four policy links. India has three social profiles; Global has none configured. |
| CMS Pages | 10 | Our Approach and Working with IGAS for India, plus four policies for each mode. |

Every collection inspected had zero draft-only documents. A draft representation and a published representation of one Strapi document should not be counted as two separate pieces of content. This does not establish that every draft field is identical to its published counterpart, or that the client has approved every published record.

The eight services are Tax & Regulatory, Risk & Compliance, Business Transformation, Advisory & Consulting, Audit & Assurance, Deals, Forensic and Strategy.

The twelve industries are Financial Services, Entertainment & Media, Healthcare & Pharma, Manufacturing, Technology, Real Estate, Consumer Products & Retail, Steel & Metal, Gold & Bullion, Sports, Mining and Education.

The six focus groups are Finance & enterprise, Innovation & creative business, Essential industries, Consumer & retail business, Built environment, and Resources & materials. Article categories cover Audit & Assurance, Business Advisory, Business Transformation, Deals & Transactions, Forensic, Industry Perspectives, Risk & Governance, Strategy, Tax & Regulatory and Technology.

**4. Homepage status and remaining refinements**

The homepage currently contains the restored hero, A Point of View and profile statistics, Latest Thinking directly beneath that section, About, Services, six featured industries, presence, careers, a contact invitation and the shared footer. The industry selection follows CMS sort order and links visitors to the full industry directory. The hero includes direct service links alongside its main calls to action.

Latest Thinking now advances every two seconds, as requested, with a 380 ms slide transition. Previous/Next and Pause controls are present. Autoplay conditions account for hover, keyboard focus, document visibility and reduced-motion preference. Two seconds is a deliberate fast setting; it can be short for someone reading the full excerpt. Keep the requested setting for now, but assess actual visitor behavior before making it faster again. An additional improvement would be to autoplay only while the carousel itself is in view.

The next homepage improvement should be stronger evidence of expertise: one approved case study, a useful featured resource or a clearly explained engagement process. Avoid adding more generic panels simply to fill space. A homepage should guide a visitor from understanding the firm to finding a service and starting a conversation.

The profile statistics—31 offices, 19 cities, 400+ employees, 38 founding partners and 40+ years of team/partner experience—come from the supplied profile. A client representative should confirm their current accuracy, scope and wording. The website currently displays two specific office addresses; those address records are separate from the broader profile claim. Team experience should continue to be distinguished from the age of the firm.

**5. Services and industry content**

The service and industry directory/detail architecture is working. Service images, descriptions, bodies, related content and SEO fields are supported. Industry records are grouped into focus areas and have individual detail routes. The homepage intentionally shows a selection rather than all twelve industries.

The principal content opportunity is specificity. Each service should clearly explain the situations it helps with, the questions the team can address, the likely stages of an engagement, the information a client may need to provide, and the practical outputs a client can expect. Exact scope and deliverables should be approved by the practice owner. Avoid promising outcomes that the firm cannot substantiate.

Each industry page should show why that industry's operating context matters: examples of information flows, reporting challenges, controls, growth decisions and relevant services. These pages will be more useful if they contain recognisable business situations rather than repeating the same advisory description with a different industry name.

One verified SEO gap is the Financial Services industry record: its dedicated `seo.metaTitle` is absent. The frontend has title fallbacks, so this does not make the page blank, but it should be completed deliberately. The absence of SEO fields on navigation/footer/focus collections is not automatically a defect: those records are not all standalone SEO pages.

**6. Article quality and presentation**

All seventeen articles passed a live rendering check: every text fragment appeared in the CMS order, and lists and section links were present. The redesigned detail layout includes a balanced title/image introduction, category/date, reading time, author when provided, numbered primary sections, contents navigation, reading progress, link sharing, highlighted practical lists and related-content imagery. Original anchor IDs are preserved. The shared renderer continues to support headings, emphasis, links, quotes, code and inline images/captions.

The article system is a good foundation. The next editorial work should add stronger authorship and review ownership, more original firm perspectives, clear update dates for changing topics, and examples approved by relevant experts. Educational articles should be reviewed before being relied on as professional guidance; publication in the CMS is not evidence of specialist approval.

Useful future article features include author profile links, topic landing pages, an editorial review date, and carefully selected downloadable checklists. Topic filtering already exists, so a second overlapping taxonomy should only be added if editors can maintain it consistently. Advanced personalisation or user accounts would be premature at this stage.

**7. Offices and location interactions**

The office directory now uses separate cards with a visible gap and transparent surrounding background. The earlier grey extension below the cards has been removed from the active directory layout. Photo clipping, address flow and action placement have been corrected. The directory supports All offices/Mumbai/Bengaluru filtering and an updated result count.

Visitors can open directions, copy an address and follow the office detail link. Email and phone actions appear only when those CMS fields exist. Directions use coordinates when supplied, otherwise the full CMS address. The same reusable actions appear on contact-page office cards and individual office pages. Clipboard failure displays manual-copy guidance instead of falsely claiming success.

Remaining improvements depend on real information: approved office photographs, verified location pins, office-specific contacts, visiting instructions and opening hours if the firm chooses to publish them. The repeated business photographs are illustrative; they should not be presented as photographs of the actual premises. Do not invent map coordinates or hours to make the layout feel complete.

**8. Footer, policies and social profiles**

The footer now contains Explore IGAS, Our Services, Our Focus and a right-hand social/policy area. LinkedIn, Instagram and X are represented by accessible vector marks rather than visible platform-name links. Policy links include Privacy Policy, Cookie Policy, Terms of Use and Disclaimer. Office details, contact information and the newsletter remain available.

A previous CMS population query was invalid and caused the frontend to omit saved footer data. That query was corrected, and the live footer integration check now verifies the CMS signature and links on Home, Contact, Our Approach and Global. This matters because a populated CMS record alone is insufficient if the website's request fails.

The India social destinations currently point to the configured `igas` profiles on LinkedIn, Instagram and X. Ownership and the intended accounts have not been independently verified. The Global footer has no social entries. Confirm the account destinations with the client; do not assume a plausible username belongs to the firm.

The policy content is published for both modes. Legal/business approval remains separate from publication. Confirm the actual operating entity, contact responsibilities, provider list, data handling, retention and market-specific wording against the deployed system. Any later change to analytics, forms or providers should trigger a policy review. This report is not legal certification.

**9. Contact form: the most important functional gap**

The contact form has required name, email, message and consent fields, optional PDF/DOC/DOCX attachment support, loading feedback, recoverable errors and a privacy link. Server validation checks fields, file extension, declared MIME type and size. The file limit is 5 MB, with a separate total-request bound. Temporary attachment handling includes cleanup.

However, `CONTACT_WEBHOOK_URL` is absent in the inspected environment, and `CONTACT_DELIVERY_MODE` is unset. A valid enquiry therefore does not have a configured delivery destination; the adapter is designed to fail safely with a 503 response. This must be resolved before treating the website as a functioning lead channel. A `mailto:` link can still open a visitor's email application, but it does not repair the form backend.

Define the receiving mailbox or CRM, delivery owner, provider endpoint, attachment policy, failure alerting and acknowledgement behavior. Test an ordinary enquiry through to actual receipt, as well as a provider timeout and rejection. A real business recipient should confirm that the message is usable and reaches the correct team. Avoid changing the UI to claim success while silently discarding an enquiry.

Attachments need an explicit decision. The current adapter sends bytes only when the approved base64 webhook mode is enabled. Declared MIME/extension checks are not malware scanning. Either configure private processing, scanning and retention controls, or remove/disable the upload option for launch. Public editorial media storage is not a suitable default destination for private enquiry documents.

**10. Newsletter: the second operational gap**

The newsletter has validation, submission feedback, throttling and a delivery-adapter boundary. `NEWSLETTER_WEBHOOK_URL` is absent and `NEWSLETTER_DELIVERY_MODE` is unset locally. There is no verified real subscription destination or subscriber lifecycle in this audit.

Agree who owns the mailing list, how consent is captured, how duplicate subscriptions behave, how unsubscribes are honoured and what content will actually be sent. Decide whether confirmation is required for the intended workflow. Test valid, duplicate, failed and unsubscribed states with the selected provider. A visible newsletter without an operated mailing programme creates an expectation the firm cannot fulfil.

**11. Global version and routing decisions**

The Global version has its own settings and footer, shared articles and policy records. Its content allocation differs from India: three services are shared, five are India-specific, and all twelve industries, six focus groups, both offices, both jobs, both leadership records and the current navigation items are India-specific.

This means Global is not a fully populated equivalent of India. Decide whether it should be a distinct international site, a lighter presentation of the Indian firm, or a view that intentionally shares most content. Then update mode assignments and editorial copy consistently. Avoid indiscriminately changing every record to shared, because some content may genuinely be location-specific.

There is also a shared-domain routing decision to resolve. The path fallback treats `/global` as Global but ordinary detail paths as India unless separate configured hostnames supply mode context. A visitor moving from `/global` to a shared service or article can therefore enter an India-rendered page. Test the whole Global journey, not just its homepage. Choose an explicit shared-domain prefix strategy or properly configured distinct origins before promising independent site experiences.

**12. CMS operations and the earlier missing-content incident**

Content, media and application code are separate assets. Git tracks schemas, components, templates and scripts; it does not automatically carry the ignored local SQLite database or uploaded media to another machine. A successful GitHub push therefore does not publish the current CMS content to a production database.

During the earlier rebase, the running CMS temporarily encountered an older schema. Some homepage and service-image columns were cleared; those fields were restored from saved snapshots. Articles, focus areas and policy records were retained. Separately, the invalid footer query explained another apparent content disappearance in the frontend.

The prevention process should be explicit: stop the CMS before changing schema revisions; make a database backup and media inventory; deploy compatible code/schema changes; verify populated fields; and retain a tested rollback path. Avoid rolling back only the database or only the source without checking compatibility.

Local SQLite backups and JSON snapshots exist under ignored CMS temporary directories, including a pre-recovery backup. Their presence is useful, but it does not establish scheduled off-device backup, retention, monitoring or a tested production restore. Define backup frequency, storage owner, recovery expectations and a restore drill.

**13. Production deployment and database readiness**

No approved production origin is configured in the inspected local frontend environment. `NEXT_PUBLIC_SITE_URL`, the optional India/Global origins and the indexing opt-in are unset. Local CMS connectivity is configured; production CMS, DNS, HTTPS, deployment ownership and secret-manager setup were not accepted in this audit.

The source supports a PostgreSQL connection configuration, but the `pg` driver is not declared in the CMS dependency list and could not be resolved from the installed Strapi database package. If PostgreSQL is selected for production, install and verify the appropriate driver as part of a controlled release, then test a real connection and restoration process. Changing `DATABASE_CLIENT` alone is insufficient evidence of readiness.

The current default Next.js production build passed during this audit using the temporary reserved origin `https://example.invalid` and indexing disabled. That proves the current source can compile/build with a valid configuration shape; it does not prove the real deployment, domain, database or providers work. No test origin was saved as the business's production URL. A fresh CMS production/admin build was not part of this audit; CMS TypeScript passed.

**14. SEO and discoverability**

The site supports CMS SEO fields, canonical URLs, Open Graph/Twitter metadata, robots rules, sitemap generation, organisation structured data and breadcrumbs. Current page SEO fields are populated on the ten CMS pages; seventeen articles and eight services also have dedicated meta titles. Financial Services is the identified industry exception.

Locally, `robots.txt` disallows crawling and the sitemap is empty because indexing is not enabled. This is appropriate preview protection. Do not interpret it as production SEO failure, and do not enable indexing until the real public origin and content have been accepted.

Remaining work includes final title/description review, canonical/Global routing checks, sitemap coverage on the approved domain, real social-preview testing, consistent favicon/brand review, and article-specific structured data where appropriate. The organisation schema currently has an empty `sameAs` list even though social links are configured; connect only client-verified profiles. The global default naming and generic site description should also be reviewed for the intended India/Global positioning.

After deployment, verify search-engine ownership and submit the approved sitemap. Track useful business outcomes and relevant queries rather than treating indexing as a guarantee of rankings or enquiries.

**15. Performance and maintainability**

Most imagery remains externally hosted: the audited image URL fields referenced Unsplash 34 times and Pexels 11 times. These are field references, not unique images. Many elements use ordinary image tags or CSS backgrounds, and Next image optimisation is disabled in the configuration.

The homepage's local development HTML response was approximately 323 KB before transfer compression; Contact was approximately 287 KB. These observations are not a production bandwidth measurement or a Lighthouse score. They do, however, support reviewing the amount of CMS content passed to client components. The shared client content includes more than just the small navigation/footer summaries needed on many pages.

Prioritise owned/approved optimised media, responsive image sizes, lazy loading, avoiding unnecessary loading of all carousel images, and smaller client data payloads. Keep full article bodies on the server where practical and pass lightweight summaries to menus/search. Measure the deployed LCP, INP and CLS before setting a performance claim or budget.

The stylesheet has grown beyond 1,300 lines and contains layers of earlier and later rules. This makes regression risk higher: a local fix may be overridden by another shared selector. A controlled consolidation into clearer component responsibilities and shared spacing/card tokens would be useful. Split the large site component into smaller feature files gradually, with regression checks; avoid a cosmetic full rewrite immediately before launch.

**16. Accessibility and motion**

Implemented features include skip navigation, landmark IDs, focus indicators, modal focus handling, semantic form labels, status/error messages, accessible social-icon names, keyboard-operable controls and reduced-motion handling. Recent local browser checks covered widths of 320, 390, 768 and 1440 pixels, including layout overflow and several interactions.

This is not a full accessibility certification. Remaining acceptance work includes real keyboard-only journeys, VoiceOver/NVDA testing, zoom/reflow, colour contrast measurements, heading hierarchy, accessible names and focus order across all page types, touch-target checks, and mobile keyboard behavior on physical devices. Test the carousel's fast timing with people who need more time to read; Pause and manual navigation must remain easy to reach.

Hover effects should stay a small enhancement. Essential information and actions must remain available on touch devices and without movement. The current added panel lift is two pixels and respects reduced-motion settings.

**17. Security and operational controls**

Useful application safeguards already exist: server-held CMS tokens, form validation, bounded request sizes, per-process rate limiting, safe content URL handling, escaped structured-data output, authenticated cache revalidation, provider timeouts and operational logs designed not to include form bodies. Anonymous requests to the audited Article and Site settings endpoints returned 403.

These observations do not constitute a complete CMS-role review or security assessment. Production work should verify scoped token permissions, admin accounts and access recovery, exact CORS origins, secret management, dependency advisories, security headers at the deployed edge/application, attachment controls and abuse protection.

The limiter uses an in-memory map per application process. It is not a shared multi-instance protection system. Define trusted proxy/IP behavior and edge or distributed limits appropriate to the actual hosting setup. Monitoring should cover frontend/CMS availability, delivery failures, database/media health, backup failures and the publication webhook. Console event logging alone is not an alerting service.

**18. What was freshly tested in this audit**

| Check | Result | Limit |
| --- | --- | --- |
| Frontend TypeScript | PASS | Static typing, not complete behavior proof. |
| CMS TypeScript | PASS | Does not prove a production database connection. |
| Article content checks | PASS | Nested rendering, safe URLs, headings, reading time and ordering. |
| Page lifecycle checks | PASS | Document versions, modes, partial updates and path collisions. |
| Readiness regressions | PASS — 19 checks | Local application checks. |
| Stage 2 contracts | PASS — 48 checks | Contract/source assertions. |
| Stage 3 contracts | PASS — 17 checks | Contract/source assertions. |
| Stage 4 contracts | PASS — 15 checks | Contract/source assertions. |
| Stage 5 contracts | PASS — 12 checks | Contract/source assertions. |
| Stage 6 contracts | FAIL | Required “Access and ownership” handover section is absent. |
| Live CMS footer integration | PASS | Home, Contact, Our Approach and Global. |
| Live article rendering | PASS — all 17 | CMS text order, lists, section anchors and listing sequence. |
| Local route audit | PASS — 18 requests returned 200 | Sixteen content routes plus robots and sitemap; not every possible detail route. |
| Current Next.js production build | PASS | Temporary reserved test origin; indexing disabled; no deployment. |
| Local CMS anonymous access checks | 403 on two endpoints | Not a full permission audit. |

Recent earlier browser checks in this implementation sequence also passed office filters/directions/copy behavior, image loading, card spacing/clipping, article navigation/progress/sharing, icon labels, carousel controls, reduced motion and several mobile widths. They are useful local regression evidence, not a replacement for a fresh production-device and assistive-technology acceptance run.

**19. Documentation and Git status**

Several older documents still describe five articles, empty collections, unavailable CMS publication and a default-build restriction. Those statements are historical and do not describe today's local system. This report supersedes them for the findings it freshly verifies; the production deployment blockers still need independent evidence.

`test:stage6` currently fails because the client handover lacks its required access/ownership section. This is a documentation/acceptance gap, not an observed frontend crash. The handover should identify who owns domains, hosting, CMS, database, media storage, provider accounts, backups, billing and access recovery, and explain how ownership is transferred without placing credentials in the repository.

Before adding this report, the repository contained eight modified tracked files and five new untracked files from recent improvements. Those changes are not part of a saved commit yet. The existing local branch can be aligned with its remote-tracking branch while its working tree still contains changes that have not been pushed. Commit and review the completed work before treating GitHub as a reproducible copy of the current site. CMS data requires its own migration/export procedure.

**20. Prioritised remaining work**

| Priority | Action | Suggested owner | Acceptance evidence |
| --- | --- | --- | --- |
| P0 | Configure contact delivery | Developer + firm operations | A controlled enquiry is received by the intended team; timeout/failure behavior is verified. |
| P0 | Decide attachment handling | Operations + developer | Private delivery/scanning/retention tested, or upload removed/disabled for launch. |
| P0 | Configure newsletter or remove its public promise | Operations + developer | Real subscription, duplicate and unsubscribe lifecycle verified. |
| P0 | Confirm domains, deployment and CMS/database targets | Client + deployment owner | Approved HTTPS origins, secrets, routing and reachable services. |
| P0 | Prepare production database and driver | Deployment owner | Driver resolves; connection, migration and restore succeed. |
| P0 | Replace or unpublish demo jobs and people | Client + editor | No demonstration records remain in public journeys or search. |
| P0 | Approve public claims, contact details and policy wording | Client/practice/content owners | Recorded approval of actual content and operational behavior. |
| P0 | Verify backup and rollback | Deployment owner | Database/media restore demonstrated against a compatible release. |
| P1 | Resolve Global content/routing strategy | Client + developer | End-to-end Global journey keeps the intended mode and content. |
| P1 | Commit reviewed code and migrate content separately | Developer + CMS owner | Reproducible release and verified published destination records. |
| P1 | Finish handover and refresh stale reports | Developer + client | Ownership/access section complete; Stage 6 check passes. |
| P1 | Complete SEO and real social previews | Editor + developer | Approved metadata, functioning previews and final-domain canonicals. |
| P1 | Optimise images and client data payloads | Developer | Measured production performance improvements, with visual parity. |
| P1 | Run deployed device/accessibility/security checks | QA + deployment owner | Recorded results and resolved material issues. |
| P1 | Add monitoring and abuse controls | Deployment owner | Alert tests and configured production limits. |
| P2 | Add approved case studies and expert profiles | Practice owners + editor | Permission-backed evidence, named review ownership and related links. |
| P2 | Add helpful resource/FAQ content | Editor + practice owners | Original useful content tied to genuine visitor questions. |

**21. Additions that would improve the business value**

The strongest next addition is a small set of approved case studies. Explain the client situation, the agreed work, what was delivered and the outcome that can be evidenced. Anonymise where permission or confidentiality requires it. Do not manufacture client logos, testimonials, savings, success rates or project values.

Real expert profiles would make educational content and service pages more credible. Include the person's approved role, experience, qualifications where verified, areas of responsibility and article contributions. These should replace demonstration profiles rather than create another parallel team directory.

A short “How we work” journey can help visitors understand the next step: initial discussion, scoping, information gathering, delivery and ongoing support as appropriate. A service-specific enquiry route could preselect the relevant practice and preserve the originating page, provided the form remains simple.

Useful original resources could include an audit-preparation checklist, a financial-information readiness guide or a practical explanation of engagement preparation. Have the relevant practice review them, label their scope and maintenance date, and decide whether they should be freely available. Gating every resource behind email may reduce its usefulness and creates more data-handling obligations.

Frequently asked questions can cover engagement preparation, office contact routes, service scope and how enquiries are handled. Industry/service topic hubs can connect related articles and resources. A genuinely operated events or webinar section could be valuable later, but an empty events section would make the site feel less complete.

For an established publishing programme, add editorial review dates, topic owners, a simple content calendar and intentional related-content selection. For an established sales process, add enquiry routing, response ownership and basic CRM attribution. Measure which services and content lead to useful conversations before investing in complex visitor personalisation.

**22. Suggested delivery sequence and completion criteria**

First, stabilise the business basics: receiving enquiries, operating the newsletter, deciding attachments, removing demo records, approving claims/policies and securing the current content backup. This should happen before another broad visual redesign.

Second, prepare a reproducible production release: reviewed source commit, database/media migration, required drivers, deployment secrets, chosen Global routing, CMS roles, cache invalidation, backup restore and monitoring. Keep staging protected from indexing.

Third, run acceptance against the actual deployment: real email/subscription receipt, all intended routes and office actions, mobile devices, keyboard/screen-reader journeys, performance measurement, canonical/sitemap checks, social previews and abuse controls. Enable indexing only after the final approved domain and content pass.

Fourth, improve authority and conversion through original case studies, real experts, better service deliverables, useful resources and a sustainable editorial process. Add features because they help visitors make a decision, not merely because there is room in the layout.

A launch should be considered complete when the firm can receive and own enquiries; the CMS data and media are safely hosted and restorable; public content is approved and free of demonstrations; the intended India/Global journeys work; and the deployed website has passed the agreed operational and user-experience checks. The current design work provides a strong base for that next phase.
