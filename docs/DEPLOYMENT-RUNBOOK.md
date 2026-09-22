# Deployment Runbook

## Pre-deployment

1. Confirm approved domains, secret manager, hosting, database, private attachment storage, delivery providers, and CORS origins.
2. Set every variable from the environment checklist in `docs/PRODUCTION-ENVIRONMENT.md`; do not copy `.env` files into artifacts.
3. Use managed PostgreSQL for CMS production and take a verified database backup. Preserve a media backup/export and the previous frontend/CMS release identifiers.
4. Review Strapi roles: public permissions minimized; Next.js has only a server-side, scoped read token.
5. Configure WAF/request-size/rate limits for `/api/contact`, `/api/newsletter`, and `/api/revalidate`. The app limiter alone is insufficient for multi-instance production.

## Deployment order

1. Deploy/verify PostgreSQL and private media storage.
2. Deploy Strapi, run its release build, apply schema changes through the approved release process, and verify authenticated health/admin access.
3. Upload and publish approved media/content; retain legacy media URL fields.
4. Deploy Next.js with `npm run build` and `npm run start`; if a CI environment reproduces the runner-only Turbopack failure, verify with `npm run build -- --webpack` and investigate the build-host restriction rather than changing app code.
5. Set `ALLOW_INDEXING=true` only after domain, canonical, sitemap, and production QA approval.
6. Configure Strapi publish/update webhooks to `/api/revalidate` using `REVALIDATION_SECRET`; test valid and invalid secrets.

## Health checks

Check the frontend homepage, `/global`, an API form failure response, `robots.txt`, `sitemap.xml` (only when indexing is enabled), Strapi authenticated content read, CMS admin, database connectivity, storage access, and provider dashboards. Never log form bodies or secrets.

## Rollback

Stop indexing if needed (`ALLOW_INDEXING=false`), revert Next.js to the previous deployment, then revert Strapi only using a compatible previous release. Restore the database from the pre-release backup only when content/schema rollback requires it; restore media together with its database references. Rotate compromised provider/API/revalidation secrets. Do not claim these backups exist until operations has tested them.

## Acceptance hold point

This runbook is not authorization to launch. Before DNS cutover or enabling indexing, record successful provider, CMS editor, webhook, browser/device, SEO, WAF and backup/rollback checks in `docs/FINAL-QA-REPORT.md`, and clear every CRITICAL blocker in `docs/LAUNCH-READINESS.md`.
