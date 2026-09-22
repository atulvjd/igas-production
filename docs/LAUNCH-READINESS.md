# Launch Readiness

## Decision: BLOCKED FROM LAUNCH

No production deployment, approved domains, credentials, client content/media, legal approval, or verified backups were supplied in this workspace. The codebase is prepared for controlled launch, but a production launch cannot be accepted without the following actions.

| Severity | Blocker | Owner | Required action | Status |
|---|---|---|---|---|
| CRITICAL | Hosting, India/Global domains and DNS absent | Client / DevOps | Provide approved origins, deploy targets and DNS ownership; exercise hostname/canonical checks. | NOT CONFIGURED |
| CRITICAL | Contact provider absent | Client / Operations | Supply approved server-side provider configuration and complete a controlled delivery/timeout/failure test. | NOT CONFIGURED |
| HIGH | Newsletter provider absent | Client / Operations | Supply approved server-side provider configuration and test valid, duplicate, timeout and failure cases. | NOT CONFIGURED |
| CRITICAL | Private attachment storage/scanning/retention absent | Client / Security | Approve private provider, malware scanning and retention policy; test no public exposure and cleanup. | NOT CONFIGURED |
| CRITICAL | Production Strapi/database/backups absent | DevOps / CMS owner | Configure PostgreSQL, Strapi secrets/CORS/roles/media, then verify backup and compatible rollback. | NOT CONFIGURED |
| HIGH | Edge WAF/rate limits absent | DevOps / Security | Configure provider-level WAF, request-size and rate rules for all API endpoints. | NOT CONFIGURED |
| CRITICAL | Approved client content, media and legal copy absent | Client / Editorial / Legal | Enter, approve and publish content/media/legal records; complete media checklist. | BLOCKED |
| HIGH | Controlled CMS, webhook and browser/device QA absent | CMS owner / QA | Exercise publish → webhook → revalidate and all route/device/editor acceptance scenarios. | BLOCKED |
| MEDIUM | Production SEO/indexing acceptance absent | Editorial / SEO | Verify final metadata/canonicals/sitemap; only then set `ALLOW_INDEXING=true`. | BLOCKED |
| LOW | Default Turbopack build unavailable in this runner | Build environment owner | Investigate runner port restriction; Webpack production build is the verified alternative. | BLOCKED |

No launch decision may be changed to ready until every CRITICAL item is PASS and the final QA report contains real deployment evidence.
