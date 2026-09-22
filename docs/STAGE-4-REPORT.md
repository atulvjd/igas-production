# IGAS Stage 4 Report

## Summary

Stage 4 adds production-operability boundaries without redesigning the site or removing fallback content. Existing Stage 2 and Stage 3 validation passed before changes. The local Next build is currently blocked in this runner by an OS-level Turbopack helper-port restriction; this occurred on the unchanged baseline as well.

## Integrations, uploads, and abuse protection

Contact and newsletter retain their Stage 3 adapter boundaries. Both now use a 10-second timeout, safe errors, correlation-ID-only logs, and application-level request throttling. Production returns 503 when no delivery endpoint is configured or when a provider fails—never false success. No real provider was configured or claimed working.

Contact attachments remain PDF/DOC/DOCX, maximum 5 MB, with MIME, extension, size, and filename validation. Bytes are never logged or publicly stored. Development accepts validated submissions without persistence. Production attachment bytes are delivered only to an explicitly approved generic endpoint using `CONTACT_ATTACHMENT_DELIVERY_MODE=webhook-base64`; otherwise the request safely fails. A client-approved private object store/provider should replace this generic adapter for long-term retention, malware scanning, and retention policy.

The current limiter is application-level and per process, appropriate only as basic single-instance protection. Add edge/WAF and shared rate limiting for multi-instance deployment.

## Domains, canonical URLs, caching

Canonical and Open Graph URLs continue to use only configured origins. Hostname mode selection activates only when both distinct India and Global origins are explicitly configured; otherwise the established `/global` path mode remains. No domains were guessed. The existing `/global` route remains valid during migration; approved domain rollout should validate navigation and CMS records before changing its canonical path policy.

`POST /api/revalidate` is secret-protected and path-allowlisted. Configure a Strapi webhook after setting `REVALIDATION_SECRET` to refresh the relevant public route. CMS fetches retain the existing 60-second fallback cache.

## CMS production readiness

`CORS_ORIGINS` stays exact-origin configured, with a local default. Production public permissions should be minimized; Next.js uses a server-only, scoped API token for published reads. The existing database configuration is already environment-driven and now documents optional PostgreSQL, while preserving local SQLite. Approved media must be uploaded to Strapi Media Library with alt text/caption and relationships; legacy URL fields stay until verification.

All modeled collections have draft/publish enabled. Next.js uses the published Strapi API behavior; drafts are not intentionally queried, listed, or added to the sitemap.

## Security and performance review

Focused review addressed provider timeouts, sensitive log removal, attachment policy, safe endpoint errors, secret-protected revalidation, CORS documentation, and public-token boundaries. This is not a penetration test. CMS calls remain parallelized and only the active mode is loaded; no visual/component rewrite was made.

## Client readiness and blockers

The content handoff is in `docs/CONTENT-MIGRATION-MATRIX.md`; required client inputs are approved copy, media, legal content, domains, provider contracts, and credentials. `docs/PRODUCTION-ENVIRONMENT.md` documents deployment configuration. Recommended Stage 5: configure and exercise approved providers, private storage/scanning/retention, edge rate limits, production media migration, and a controlled CMS runtime test environment.

## Files changed

Operational helpers, contact/newsletter routes and adapters, protected revalidation route, domain utility, environment examples, Stage 4 validator, and production handoff documentation.
