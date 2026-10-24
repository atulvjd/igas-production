# Article order and presentation

Article **Sort order** controls the sequence used by the homepage carousel, Latest thinking listing, menus and search. Lower numbers appear first. The five current articles use values 1–5. Equal values use publication date (or the original date) newest first, then slug alphabetically as a stable tie-breaker. Featured does not remove other articles from the homepage carousel.

Write the article body in Strapi Blocks in the intended reading order. Use Heading 2 for primary sections and Heading 3 for subsections, proper lists for bullet points/steps, and link or formatting controls for inline content. Empty paragraphs are omitted from the reading view. The website preserves paragraphs, nested ordered/unordered lists, text emphasis, links, quotations, code and inline images/captions. CMS media URLs in blocks are normalized before rendering. Executable URL schemes are not rendered as links or images.

Detail pages display title, introduction, author when supplied, reading time, cover image/caption, section navigation, the body, and related content. The listing uses the same article order with topic filters and a larger first card. Article links use `/latest-thinking/[slug]`; the older `/articles/[slug]` URLs remain supported.

The five existing local articles were assigned explicit order and had their headings/list structures corrected without changing or reordering their text. Both draft and published snapshots were backed up to `cms/.tmp/article-format-2026-10-22T17-40-53-059Z.json` before editing. `scripts/format-local-articles.mjs` records that one-time local formatting operation; review it before rerunning after editorial changes.

Run `node scripts/test-article-content.mjs` for nested-content rendering, safe links, reading time and ordering regressions. The same renderer is used by articles, service/industry detail pages, custom Page rich text, jobs, offices and leadership biographies.
