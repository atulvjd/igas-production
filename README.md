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

Open [http://localhost:1337/admin](http://localhost:1337/admin), create the first administrator, and add published Site settings, Services, Industries, Articles, Pages, Jobs, Offices, Leadership profiles, Navigation items, and Footers. Create one published Site setting for each mode (`india` and `global`). The Site setting controls shared defaults such as the homepage hero, imagery, newsletter title, footer signature, and contact details.

Pages are the fully editable page-builder layer. Set `path` to the URL you want to control (`/` for the India homepage or `/global` for the global homepage), choose the mode, and add sections to the `sections` dynamic zone. Editors can add, remove, reorder, and configure Hero, Rich text, Image and text, Stats, Carousel, and Call to action sections. Carousel slides are repeatable, so the homepage carousel can be changed entirely from the admin panel without code.

Services, Industries, and Articles control the corresponding navigation, listings, detail pages, and insight content. A published Page takes precedence for its path; existing frontend pages remain as a fallback until each page is migrated into the builder.

Create a read-only API token in Strapi under Settings, then copy `.env.example` to `.env.local` and set `STRAPI_API_TOKEN`. The website keeps its static defaults when Strapi is unavailable, so publishing can be staged safely before connecting production.

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

Contact and newsletter delivery are server-only adapters. Local development can use `CONTACT_DELIVERY_MODE=development` and `NEWSLETTER_DELIVERY_MODE=development`; production requires `CONTACT_WEBHOOK_URL` and/or `NEWSLETTER_WEBHOOK_URL` to be configured. Contact attachments are limited to PDF, DOC, and DOCX files up to 5 MB, and only sanitized attachment metadata is sent through the generic webhook adapter until a file-storage/email provider is selected.

The Next.js home page reads CMS content when both `STRAPI_URL` and `STRAPI_API_TOKEN` are configured. Until then, it uses the existing static content as a fallback.
## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
