# igas

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_RHbJDkMf8VrUTv9qVaIA32tLXrY9)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## CMS setup

Strapi lives in `cms/` and uses SQLite for local development. From this project root:

```bash
npm run dev:cms
```

Open [http://localhost:1337/admin](http://localhost:1337/admin), create the first administrator, and add published Site settings, Services, Industries, Focus areas, Articles, Pages, Jobs, Offices, Leadership profiles, Navigation items, and Footers. Create one published Site setting for each mode (`india` and `global`). Site settings control the homepage copy and imagery, Careers and About copy, footer signature, contact details, and the labels, descriptions, headings, and calls to action used by each expanded header menu.

Manage the “Where we focus” categories in **Focus areas**: create and publish each category, set its display order and mode, and relate the Industries that should appear beneath it. Existing industry records not assigned to a focus area remain accessible from the focus menu. In each Site setting, edit the repeatable **Mega menu content** components to update What we do, Where we focus, Who we are, Latest thinking, and Careers copy. Create Navigation items with group `who-we-are` to define the Who we are menu links; `parentGroup` forms subgroups and `description` supplies the subgroup summary. Add the read permission for Focus areas to the website's Strapi API token so published categories and their related industries can be read.

Pages are the fully editable page-builder layer. Set `path` to the URL you want to control (`/` for the India homepage or `/global` for the global homepage), choose the mode, and add sections to the `sections` dynamic zone. Editors can add, remove, reorder, and configure Hero, Rich text, Image and text, Stats, Carousel, and Call to action sections. Carousel slides are repeatable, so the homepage carousel can be changed entirely from the admin panel without code.

Services, Industries, Focus areas, Articles, Jobs, Offices, Leadership profiles, Navigation items, Footers, Site settings, and Pages are normalized by the server-side adapter and rendered in the existing site components. Built-in routes retain their existing page layouts and consume collection and Site setting content; published Page Builder entries control custom paths. Empty collections render empty states or hide optional sections. No mock business records are used when the CMS is empty or unavailable.

Create a read-only API token in Strapi under Settings, then copy `.env.example` to `.env.local` and set `STRAPI_API_TOKEN`. Set the same strong `REVALIDATION_SECRET` in the website's `.env.local` and the CMS's `cms/.env`; set `NEXT_APP_URL` in `cms/.env` to the website origin. On startup, Strapi configures a webhook for content entry and media changes. Published CMS changes then invalidate the website's CMS cache and pages immediately; the 60-second fetch revalidation remains a fallback.

Only published Strapi records are public. Save and publish CMS content to make it appear on the website; drafts are intentionally excluded. Legacy content without a `mode` is shared across India and Global, while records explicitly assigned a mode are only shown on that site.

For clearly marked, non-destructive local demo records, start Strapi with:

```bash
SEED_DEMO_CONTENT=true npm run dev:cms
```

The seed checks for existing slugs/modes before creating records and never overwrites existing content. It creates demo Site Settings, an Office, a Job, a Leadership profile, a Navigation item, a Footer, and a Page at `/demo-stage-2`.

Run the lightweight Stage 2 contract checks with:

```bash
npm run test:stage2
```

Stage 3 contract checks are available with:

```bash
npm run test:stage3
```

The readiness regression checks for request limits, consent validation, route path guards, and analytics gating run with:

```bash
npm run test:readiness
```

Enquiries and job applications can be reviewed in separate Enquiries and Job Applications inboxes in Strapi’s far-left navigation. Configure the same server-only `STRAPI_SUBMISSIONS_SECRET` (32+ random characters) in `.env.local` and `cms/.env`. Submissions and private attachments are saved in the database; the admin panel has a download control. Enquiries accept an optional brief; job applications require a CV and an open, published role. PDF, DOC and DOCX files are limited to 3 MB. See [production environment](docs/PRODUCTION-ENVIRONMENT.md#private-strapi-submission-inboxes) for hosted setup, backups, access and retention. Legacy contact/application webhook adapters remain available when inbox storage is unconfigured. Newsletter delivery uses its separate provider adapter.

Production builds require `NEXT_PUBLIC_SITE_URL` to be set to the approved HTTPS origin. The analytics preference is opt-in and stored in a first-party cookie; marketing analytics is not connected. See [production environment](docs/PRODUCTION-ENVIRONMENT.md) for the analytics, request-size, attachment, and launch configuration boundaries.

The website reads published CMS content when both `STRAPI_URL` and `STRAPI_API_TOKEN` are configured. When the CMS is unavailable or a collection has no published records, business-content lists stay empty and use their empty states; only technical UI defaults and brand assets remain as fallbacks. See [CMS integration status](docs/CMS-INTEGRATION-STATUS.md) for the collection mapping and current live verification limits.
## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
# igas-production

## Newsletter administration

The Strapi **Newsletter** menu separates subscribers and newsletter drafts from website content. Footer signups require consent and are stored privately as pending subscribers using the existing submission credential. Drafts support subject, preview text, Markdown content and an optional image. Saving or publishing a newsletter does not send emails; delivery and automated confirmation/unsubscribe flows require an email provider integration. See [newsletter setup](docs/PRODUCTION-ENVIRONMENT.md#newsletter-cms).
