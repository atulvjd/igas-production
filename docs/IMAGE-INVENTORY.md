# Website image inventory

Updated 25 October 2026. The local CMS now has 71 independent image slots using 71 distinct photograph sources. Sources were visually reviewed in contact sheets; image responses and preview hashes were checked before publishing. Query-string variations of one source photograph count as duplicates.

Each content item retains its own image when it appears in a listing, detail page or related card. Distinct topics and independently editable page/section slots have separate photographs. Brand marks remain consistent. Text-focused policy pages, statistics, forms and compact navigation do not need decorative photography.

## CMS editing

- Site settings: Hero/About/Careers images, plus separate Contact, About page, Careers page, Presence and Leadership image URL/alt fields for each mode.
- Services, industries, articles and offices: image URL and alt fields; uploaded media remains preferred when supplied.
- Focus areas and leadership profiles: optional image URL/alt fields alongside the existing content fields. Leadership images are contextual team scenes, explicitly illustrative, not named-person portraits.
- Custom Pages: the existing hero/image-text/carousel image fields.

The CMS was stopped and a SQLite online backup was made before adding fields. API snapshots and journals are under ignored `cms/.tmp/unique-images-*/`. The earlier snapshot before this task is `/tmp/igas-images-before.json`; the database recovery backup is under `cms/.tmp/before-unique-images-*.db`.

Repeatable update: `node --env-file=.env.local --env-file=.env.cms-edit.local scripts/assign-editorial-images.mjs`. Verification: `node --env-file=.env.local scripts/check-editorial-images.mjs`. The manifest is `scripts/content/editorial-images.json`. Review mappings before rerunning after editorial changes.

## Photograph sources

| CMS collection | Record / mode | Image slot | Visual subject / alt text | Source |
| --- | --- | --- | --- | --- |
| site-settings | india | heroImageUrl | A collaborative business discussion; illustrative photography | [Photo source](https://www.pexels.com/photo/3184291/) |
| site-settings | india | aboutImageUrl | Hands joined together in a collaborative team; illustrative photography | [Photo source](https://www.pexels.com/photo/3184418/) |
| site-settings | india | careersImageUrl | Colleagues learning and working together; illustrative photography | [Photo source](https://www.pexels.com/photo/1181403/) |
| site-settings | india | contactImageUrl | A handshake at the start of a business conversation; illustrative photography | [Photo source](https://www.pexels.com/photo/3184465/) |
| site-settings | india | aboutPageImageUrl | A team exchanging ideas around a meeting table; illustrative photography | [Photo source](https://www.pexels.com/photo/1181619/) |
| site-settings | india | careersPageImageUrl | Colleagues collaborating with laptops; illustrative photography | [Photo source](https://www.pexels.com/photo/3184325/) |
| site-settings | india | presenceImageUrl | Aerial view of the Mumbai cityscape; illustrative photography | [Photo source](https://www.pexels.com/photo/37853147/) |
| site-settings | india | leadershipImageUrl | A professional team discussing ideas; illustrative photography | [Photo source](https://www.pexels.com/photo/3184339/) |
| site-settings | global | heroImageUrl | A business team gathered in a bright meeting room; illustrative photography | [Photo source](https://www.pexels.com/photo/1181406/) |
| site-settings | global | aboutImageUrl | Colleagues joining hands in a team exercise; illustrative photography | [Photo source](https://www.pexels.com/photo/3184423/) |
| site-settings | global | careersImageUrl | Colleagues working together in an open workspace; illustrative photography | [Photo source](https://www.pexels.com/photo/3184357/) |
| site-settings | global | contactImageUrl | A team having a business conversation; illustrative photography | [Photo source](https://www.pexels.com/photo/3184300/) |
| site-settings | global | aboutPageImageUrl | Colleagues greeting one another at work; illustrative photography | [Photo source](https://www.pexels.com/photo/3184301/) |
| site-settings | global | careersPageImageUrl | An informal collaborative team meeting; illustrative photography | [Photo source](https://www.pexels.com/photo/3184302/) |
| site-settings | global | presenceImageUrl | Mumbai skyline viewed from Marine Drive; illustrative photography | [Photo source](https://www.pexels.com/photo/33724508/) |
| site-settings | global | leadershipImageUrl | Colleagues reviewing information together; illustrative photography | [Photo source](https://www.pexels.com/photo/3184360/) |
| services | tax-regulatory | imageUrl | Tax planning documents with tax-labelled blocks; illustrative photography | [Photo source](https://www.pexels.com/photo/6863183/) |
| services | risk-compliance | imageUrl | Financial charts examined with a magnifying glass; illustrative photography | [Photo source](https://www.pexels.com/photo/6801648/) |
| services | business-transformation | imageUrl | A team planning change using a wall of notes; illustrative photography | [Photo source](https://www.pexels.com/photo/3184296/) |
| services | advisory-consulting | imageUrl | Colleagues reviewing business information together; illustrative photography | [Photo source](https://www.pexels.com/photo/3184639/) |
| services | audit-assurance | imageUrl | A professional examining printed financial records; illustrative photography | [Photo source](https://www.pexels.com/photo/7821484/) |
| services | deals | imageUrl | Business representatives shaking hands across a meeting table; illustrative photography | [Photo source](https://www.pexels.com/photo/5668859/) |
| services | forensic | imageUrl | A gavel beside a laptop illustrating careful investigation; illustrative photography | [Photo source](https://www.pexels.com/photo/5668473/) |
| services | strategy | imageUrl | A professional developing a plan at a whiteboard; illustrative photography | [Photo source](https://www.pexels.com/photo/1181345/) |
| industries | financial-services | imageUrl | Financial market prices on a trading display; illustrative photography | [Photo source](https://www.pexels.com/photo/210607/) |
| industries | entertainment-media | imageUrl | A film clapperboard on a production set; illustrative photography | [Photo source](https://www.pexels.com/photo/3945313/) |
| industries | healthcare | imageUrl | A laboratory scientist working with research equipment; illustrative photography | [Photo source](https://www.pexels.com/photo/2280571/) |
| industries | manufacturing | imageUrl | A factory worker operating industrial machinery; illustrative photography | [Photo source](https://www.pexels.com/photo/1108101/) |
| industries | technology | imageUrl | Computer screens used for software development; illustrative photography | [Photo source](https://www.pexels.com/photo/1181675/) |
| industries | real-estate | imageUrl | Modern high-rise commercial buildings; illustrative photography | [Photo source](https://www.pexels.com/photo/936722/) |
| industries | consumer-products-retail | imageUrl | Fresh produce on display in a supermarket; illustrative photography | [Photo source](https://www.pexels.com/photo/264636/) |
| industries | steel-metal | imageUrl | Steel cutting machinery producing sparks; illustrative photography | [Photo source](https://www.pexels.com/photo/17167905/) |
| industries | gold-bullion | imageUrl | Gold bullion bars; illustrative photography | [Photo source](https://www.pexels.com/photo/386318/) |
| industries | sports | imageUrl | A floodlit sports field at night; illustrative photography | [Photo source](https://www.pexels.com/photo/399187/) |
| industries | mining | imageUrl | Heavy trucks operating in an open-pit mine; illustrative photography | [Photo source](https://www.pexels.com/photo/29506757/) |
| industries | education | imageUrl | Graduates celebrating an education milestone; illustrative photography | [Photo source](https://www.pexels.com/photo/267885/) |
| articles | rethinking-risk-connected-world | imageUrl | Technology professionals inspecting a server facility; illustrative photography | [Photo source](https://www.pexels.com/photo/1181316/) |
| articles | building-resilient-organizations | imageUrl | A team supporting one another in a collaborative exercise; illustrative photography | [Photo source](https://www.pexels.com/photo/3184428/) |
| articles | technology-catalyst-for-change | imageUrl | A developer working on a laptop; illustrative photography | [Photo source](https://www.pexels.com/photo/1181467/) |
| articles | navigating-growth-changing-economy | imageUrl | A financial trend viewed on a mobile device; illustrative photography | [Photo source](https://www.pexels.com/photo/6347729/) |
| articles | future-of-business-transformation | imageUrl | Colleagues sharing ideas during a planning session; illustrative photography | [Photo source](https://www.pexels.com/photo/3184644/) |
| articles | audit-readiness-before-year-end | imageUrl | Printed reports and financial information under review; illustrative photography | [Photo source](https://www.pexels.com/photo/7681091/) |
| articles | organising-tax-records | imageUrl | A calculator and financial records on a desk; illustrative photography | [Photo source](https://www.pexels.com/photo/4386373/) |
| articles | cash-flow-visibility-growing-business | imageUrl | A hand reviewing figures and a financial chart; illustrative photography | [Photo source](https://www.pexels.com/photo/590022/) |
| articles | internal-controls-growing-team | imageUrl | A professional recording information on a laptop; illustrative photography | [Photo source](https://www.pexels.com/photo/6693661/) |
| articles | responding-suspected-irregularity | imageUrl | A professional examining records beside a gavel; illustrative photography | [Photo source](https://www.pexels.com/photo/5668772/) |
| articles | preparing-transaction-information | imageUrl | A close view of a business handshake; illustrative photography | [Photo source](https://www.pexels.com/photo/3184431/) |
| articles | practical-transformation-roadmap | imageUrl | A professional mapping ideas on a whiteboard; illustrative photography | [Photo source](https://www.pexels.com/photo/3184658/) |
| articles | management-reporting-decisions | imageUrl | Colleagues reviewing printed business charts; illustrative photography | [Photo source](https://www.pexels.com/photo/3184292/) |
| articles | inventory-visibility-manufacturing | imageUrl | Coiled industrial metal stored for manufacturing; illustrative photography | [Photo source](https://www.pexels.com/photo/8940223/) |
| articles | data-foundations-reporting-tools | imageUrl | A developer checking connected digital tools; illustrative photography | [Photo source](https://www.pexels.com/photo/1181244/) |
| articles | financial-clarity-healthcare-pharma | imageUrl | A healthcare professional discussing patient care; illustrative photography | [Photo source](https://www.pexels.com/photo/3825586/) |
| articles | strategic-priorities-workable-plan | imageUrl | A written work plan beside a laptop; illustrative photography | [Photo source](https://www.pexels.com/photo/3184666/) |
| offices | mumbai | imageUrl | Mumbai skyline at night; city context, not a photograph of IGAS premises | [Photo source](https://www.pexels.com/photo/5414582/) |
| offices | bengaluru | imageUrl | Bengaluru city skyline; city context, not a photograph of IGAS premises | [Photo source](https://unsplash.com/photos/sEDewKyq6YM) |
| focus-areas | finance-enterprise | imageUrl | Financial information reviewed on a tablet; illustrative photography | [Photo source](https://www.pexels.com/photo/6802049/) |
| focus-areas | innovation-creative-business | imageUrl | A collaborative team developing ideas on a whiteboard; illustrative photography | [Photo source](https://www.pexels.com/photo/1181533/) |
| focus-areas | essential-industries | imageUrl | Laboratory test tubes used in scientific work; illustrative photography | [Photo source](https://www.pexels.com/photo/2280549/) |
| focus-areas | consumer-retail | imageUrl | A shopping trolley illustrating consumer and retail activity; illustrative photography | [Photo source](https://www.pexels.com/photo/5632402/) |
| focus-areas | built-environment | imageUrl | Commercial buildings viewed from street level; illustrative photography | [Photo source](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab) |
| focus-areas | resources-materials | imageUrl | Industrial workers inspecting steel coils in a factory; illustrative photography | [Photo source](https://www.pexels.com/photo/32845682/) |
| leadership-profiles | demo-advisory-lead | imageUrl | Illustrative advisory-team collaboration; not a portrait of an IGAS leader | [Photo source](https://www.pexels.com/photo/3182742/) |
| leadership-profiles | demo-assurance-lead | imageUrl | Illustrative professional presentation; not a portrait of an IGAS leader | [Photo source](https://www.pexels.com/photo/3184317/) |
| pages | /our-approach | sections.0.imageUrl | Colleagues working through a business challenge; illustrative photography | [Photo source](https://www.pexels.com/photo/3184293/) |
| pages | /our-approach | sections.2.imageUrl | A team agreeing a scope in a meeting room; illustrative photography | [Photo source](https://www.pexels.com/photo/1181396/) |
| pages | /working-with-igas | sections.1.imageUrl | A prepared workspace for the first conversation; illustrative photography | [Photo source](https://www.pexels.com/photo/3184460/) |
| pages | /our-approach | sections.5.slides.0.imageUrl | Financial chart analysis; illustrative photography | [Photo source](https://www.pexels.com/photo/5834234/) |
| pages | /our-approach | sections.5.slides.1.imageUrl | A presentation of financial information; illustrative photography | [Photo source](https://www.pexels.com/photo/6285126/) |
| pages | /our-approach | sections.5.slides.2.imageUrl | A collaborative business meeting; illustrative photography | [Photo source](https://images.unsplash.com/photo-1553877522-43269d4ea984) |
| pages | /our-approach | sections.5.slides.3.imageUrl | Financial planning and calculation; illustrative photography | [Photo source](https://www.pexels.com/photo/6120214/) |
| pages | /our-approach | sections.5.slides.4.imageUrl | A professional audience at a presentation; illustrative photography | [Photo source](https://images.unsplash.com/photo-1591115765373-5207764f72e7) |

## Validation

All 71 planned image fields were read back from the published CMS. Image-source checks verified distinct identities and preview bytes. A rendered HTML audit covered 59 routes with no duplicate photograph within a page’s main content. Non-image content and record counts were preserved for 59 published records. Frontend/CMS typing, article content rendering and footer checks passed. Browser checks covered eleven page types at 320, 390, 768 and 1440 pixels; representative screenshots were inspected.
