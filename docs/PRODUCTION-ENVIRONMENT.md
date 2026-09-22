# Production Environment

No production values are stored in this repository. Keep every secret in the deployment secret manager.

## Final environment checklist

| Variable | Classification | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | PUBLIC | Approved default site origin only. |
| `NEXT_PUBLIC_INDIA_SITE_URL` | PUBLIC | Approved India origin; optional until domain launch. |
| `NEXT_PUBLIC_GLOBAL_SITE_URL` | PUBLIC | Approved Global origin; optional until domain launch. |
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

Public values: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_INDIA_SITE_URL`, and `NEXT_PUBLIC_GLOBAL_SITE_URL`. Set the latter two only with approved, distinct production origins. `NEXT_PUBLIC_SITE_URL` remains the fallback origin. The public variables must contain URLs only—never tokens or credentials.

Server-only values: `STRAPI_URL`, `STRAPI_API_TOKEN`, `CONTACT_DELIVERY_MODE`, `CONTACT_WEBHOOK_URL`, `CONTACT_ATTACHMENT_DELIVERY_MODE`, `NEWSLETTER_DELIVERY_MODE`, `NEWSLETTER_WEBHOOK_URL`, and `REVALIDATION_SECRET`.

Use a scoped, read-only Strapi API token only in Next.js server runtime. Contact/newsletter delivery modes are `development` locally; production must set an approved webhook/provider endpoint. Without one, the APIs return 503. A contact attachment is rejected in production unless `CONTACT_ATTACHMENT_DELIVERY_MODE=webhook-base64` has been explicitly approved for the configured private provider endpoint.

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
