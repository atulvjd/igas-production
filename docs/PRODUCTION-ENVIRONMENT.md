# Production Environment

No production values are stored in this repository. Keep every secret in the deployment secret manager.

## Final environment checklist

| Variable | Classification | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | PUBLIC / REQUIRED IN PRODUCTION | Approved HTTPS canonical origin; production builds fail if missing or invalid. |
| `NEXT_PUBLIC_INDIA_SITE_URL` | PUBLIC | Approved India HTTPS origin; optional when one shared domain is used. |
| `NEXT_PUBLIC_GLOBAL_SITE_URL` | PUBLIC | Approved Global HTTPS origin; configure together with the India origin for hostname routing. |
| `ALLOW_INDEXING` | DEPLOYMENT-ONLY | Set `true` only for approved production; defaults to safe no-index. |
| `STRAPI_URL` | SERVER-ONLY | Next.js-to-Strapi server endpoint. |
| `STRAPI_API_TOKEN` | SERVER-ONLY | Scoped read-only Strapi token; never public. |
| `CONTACT_DELIVERY_MODE`, `CONTACT_WEBHOOK_URL`, `CONTACT_ATTACHMENT_DELIVERY_MODE` | SERVER-ONLY | Approved contact delivery configuration. |
| `NEWSLETTER_DELIVERY_MODE`, `NEWSLETTER_WEBHOOK_URL` | SERVER-ONLY | Approved newsletter configuration. |
| `REVALIDATION_SECRET` | SERVER-ONLY | Strapi-to-Next cache webhook authorization. |
| `HOST`, `PORT` | CMS-ONLY | Strapi listener configuration. |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY` | CMS-ONLY | Strapi application/admin secrets. |
| `CORS_ORIGINS` | CMS-ONLY | Exact allowed frontend origins. |
| `DATABASE_CLIENT`, `DATABASE_URL`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SSL`, `DATABASE_SSL_REJECT_UNAUTHORIZED` | CMS-ONLY | Database connection configuration. |

No API token, provider credential, database password, or webhook/revalidation secret belongs in a `NEXT_PUBLIC_*` variable.

## Next.js

Public values: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_INDIA_SITE_URL`, and `NEXT_PUBLIC_GLOBAL_SITE_URL`. `NEXT_PUBLIC_SITE_URL` is mandatory for production builds and must be the approved HTTPS origin with no path, query, fragment, username, or password. There is no production fallback domain. India and Global origins are optional for a shared-domain launch; configure both as approved, distinct HTTPS origins to enable hostname routing. Public variables must contain URLs only—never tokens or credentials.

Server-only values: `STRAPI_URL`, `STRAPI_API_TOKEN`, `CONTACT_DELIVERY_MODE`, `CONTACT_WEBHOOK_URL`, `CONTACT_ATTACHMENT_DELIVERY_MODE`, `NEWSLETTER_DELIVERY_MODE`, `NEWSLETTER_WEBHOOK_URL`, and `REVALIDATION_SECRET`.

Use a scoped, read-only Strapi API token only in Next.js server runtime. Enquiries and applications use the private Strapi inboxes when the shared submission secret is set; legacy webhook delivery is an optional alternative. Newsletter production delivery needs its own provider endpoint. Unconfigured production delivery returns 503. Form requests are limited to 3 MiB plus multipart overhead; newsletter JSON requests are limited to 16 KiB. Configure matching edge/WAF limits because platform and proxy limits may run before the application.

The cookie preference is persisted in `igas-consent` for one year. Vercel Analytics is loaded only after opt-in and outgoing events are rejected after the choice is withdrawn. This technical default does not establish whether analytics consent is legally required; have legal/product owners approve the copy, retention, and market-specific behavior. No marketing tracking is connected.

A contact attachment is validated for declared MIME type, extension, and size, but those checks are not malware scanning. The current adapter can send its bytes as base64 only when `CONTACT_ATTACHMENT_DELIVERY_MODE=webhook-base64` is explicitly approved for the configured provider. Do not enable that mode until the endpoint provides private access, scanning, retention/deletion, and incident controls. The repository does not provide those external controls.

Configure Strapi webhooks to `POST /api/revalidate` with `Authorization: Bearer <REVALIDATION_SECRET>` and JSON `{ "path": "/the-updated-path" }`. The endpoint accepts only normalized public path characters, never absolute URLs.

Build and start: `npm run build`, `npm run start`; CMS: `npm run build:cms`, then `npm run start:cms`.

## Strapi

Set `CORS_ORIGINS` to a comma-separated list of exact approved frontend origins. Do not use `*` for authenticated or private CMS access. Set `HOST`, `PORT`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, and `ENCRYPTION_KEY` to unique managed secrets.

SQLite is the local default. For production, use managed PostgreSQL with `DATABASE_CLIENT=postgres` and either `DATABASE_URL` or the discrete `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` variables. Configure `DATABASE_SSL` and certificate settings as required by the provider. Strapi schemas are source-controlled; take a database backup and run a release build before upgrading or deploying schema changes. Do not overwrite local SQLite data.

Public Strapi permissions should be disabled/minimized. Next.js retrieves published content using its server-only Strapi API token; Strapi admin and upload APIs require authenticated roles. Review roles and token scope after each new collection or plugin.

Use a private media provider/bucket for contact documents. Strapi editorial media may be public only where explicitly intended. Keep legacy URL fields until Media Library relationships and records have been verified.

## Operations

The built-in form limiter is application-level, per process, and intentionally replaceable. It is not a distributed production limiter. Deploy an edge/WAF/provider limit (and a shared-store implementation if needed) before a multi-instance public launch. Safe operational logs include event, time, category, and correlation ID only.

## Final acceptance gate

Do not set production values, enable `ALLOW_INDEXING`, or publish a launch until operations has verified this checklist in the target environment: secrets exist only in the approved secret manager; exact CORS origins and scoped Strapi token are active; provider/storage acceptance tests pass; WAF and request-size rules are active; PostgreSQL/media backups are verified; and domain canonical/webhook checks pass. The current workspace has none of those external configurations.

## Private Strapi submission inboxes

Both website forms save to Strapi when `STRAPI_SUBMISSIONS_SECRET` is configured. Set the same strong random value (at least 32 characters) in the Next.js server environment and the CMS environment. Never use a `NEXT_PUBLIC_` variable. Keep `STRAPI_API_TOKEN` read-only; the dedicated submission secret only permits creation and does not expose inbox reads.

- Far-left navigation → Enquiries: sender details, message, optional brief, consent, received date, status, and internal notes.
- Far-left navigation → Job Applications: sender details, role slug/title, message, required CV, consent, received date, status, and internal notes.
- The Submitted file control downloads the original attachment from the authenticated admin view. Files are stored as base64 JSON in the database, not the public Media Library or ephemeral Render filesystem. Include these tables in database backups, restrict admin roles, and delete attachments with the record when its retention period expires. Base64 increases storage by roughly one third; this approach suits a modest-volume inbox.
- New entries start with status `new`; editors can set `reviewing`, `contacted`, or `closed`. These collections have no draft/publish workflow and no public REST read/update/delete routes. Their POST routes require the server-only shared secret. Do not grant public role permissions for submissions.
- Files are PDF, DOC, or DOCX, up to 3 MB, checked for extension, declared type, decoded size, and document signature. Signature checking is not malware scanning: only download expected documents with normal endpoint protections. The 3 MB limit keeps incoming multipart requests below Vercel's function body limit. Strapi's JSON limit is 5 MB for the base64 payload.
- The backend independently validates the currently published, open job and deadline. A failed database save returns an error; it never confirms successful delivery.

With the submission secret configured, these inboxes take precedence over legacy webhook delivery. Email/webhook settings are optional and not needed to review submissions in Strapi. Without the secret, the existing webhook/development adapters remain available; production rejects unconfigured delivery.

Local setup: `.env.local` and `cms/.env` contain matching ignored credentials. Restart Strapi after changing the secret. Check `node --env-file=.env.local scripts/test-strapi-submissions.mjs` against local servers; it creates and removes synthetic records, verifies stored file bytes and validates access controls.

Hosted rollout: deploy the CMS code and rebuilt admin panel on Render, set the shared secret in Render and Vercel, then deploy the website. Use the existing persistent production database with backups. Verify both inboxes through a synthetic website submission before collecting real submissions. Local changes do not configure or deploy either hosted service.

The dedicated inbox screens are separate from the Content Manager website collections. They reuse authenticated Content Manager endpoints and existing per-collection read/update permissions; hiding their content navigation links does not change their schemas, records, or permissions. Menu access requires the corresponding collection read permission.
