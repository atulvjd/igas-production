# Article order and presentation

Article **Sort order** controls the sequence used by the homepage carousel, Latest thinking listing, menus and search. Lower numbers appear first. The published articles use explicit Sort order values. Equal values use publication date (or the original date) newest first, then slug alphabetically as a stable tie-breaker. Featured does not remove other articles from the homepage carousel.

Write the article body in Strapi Blocks in the intended reading order. Use Heading 2 for primary sections and Heading 3 for subsections, proper lists for bullet points/steps, and link or formatting controls for inline content. Empty paragraphs are omitted from the reading view. The website preserves paragraphs, nested ordered/unordered lists, text emphasis, links, quotations, code and inline images/captions. CMS media URLs in blocks are normalized before rendering. Executable URL schemes are not rendered as links or images.

Detail pages display title, introduction, author when supplied, reading time, cover image/caption, section navigation, the body, and related content. The listing uses the same article order with topic filters and a larger first card. Article links use `/latest-thinking/[slug]`; the older `/articles/[slug]` URLs remain supported.

The five existing local articles were assigned explicit order and had their headings/list structures corrected without changing or reordering their text. Both draft and published snapshots were backed up to `cms/.tmp/article-format-2026-10-22T17-40-53-059Z.json` before editing. `scripts/format-local-articles.mjs` records that one-time local formatting operation; review it before rerunning after editorial changes.

Run `node scripts/test-article-content.mjs` for nested-content rendering, safe links, reading time and ordering regressions. The same renderer is used by articles, service/industry detail pages, custom Page rich text, jobs, offices and leadership biographies.

## Article detail layout

Article pages use a split introduction with the CMS cover image, category/date, excerpt and reading time. Primary sections are visually grouped using Heading 2; their original block IDs and text order are retained. Sections containing lists, or headings such as “Key takeaways”, “At a glance” and “Practical checklist”, receive a subtle green panel automatically. Other shared rich-text pages keep their existing rendering.

The contents panel includes numbered section links, reading progress and a copy-link button. Copying shares the article URL without its section fragment; browsers that deny clipboard access show a manual-sharing message. Related cards use the images of linked CMS articles, services and industries. The closing contact invitation uses the existing Site settings contact fields. No new CMS fields or schema migration are required.

Local validation for this presentation update: frontend TypeScript and rich-text checks passed; all 17 published articles retained every text fragment in CMS order and matching section links. Browser checks passed at 320, 390, 768 and 1440 pixels for overflow, section navigation, progress and related imagery. Copy-link success, exact URL, denied-clipboard guidance, the article alias and unchanged service rendering were also checked. No CMS records or schemas were changed.
