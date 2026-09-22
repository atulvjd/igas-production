# Production QA Checklist

Status values are evidence-based: PASS, BLOCKED, NOT CONFIGURED, or N/A. “Blocked” items require the listed external configuration; they are not production approvals.

| Area | Status | Evidence / action before launch |
|---|---|---|
| Functionality / fallback routes | PASS | Stage 2–5 contract suites and Webpack production build pass. Exercise all routes in deployed browser QA. |
| CMS published/draft behavior | NOT CONFIGURED | Requires controlled Strapi test environment and editor account. Published REST reads are the intended path; drafts must remain absent. |
| Contact form | NOT CONFIGURED | Adapter validation/failure behavior exists; approved provider credentials and acceptance test are absent. |
| Newsletter | NOT CONFIGURED | Adapter validation/failure behavior exists; approved provider credentials and duplicate behavior test are absent. |
| Uploads | NOT CONFIGURED | Validation and private temporary handling pass code review; approved private storage/scanning/retention provider is absent. |
| SEO / canonical / Open Graph | PASS | Code review and build verify configured-origin utilities. Verify final tags after approved domains/content exist. |
| Robots and indexing | PASS | Indexing is opt-in through `ALLOW_INDEXING=true`; preview/default environments emit no-index and empty sitemap. |
| Security | BLOCKED | Focused code review complete; WAF, provider review, production permission audit and external penetration testing remain. |
| Performance | PASS | CMS reads are parallel and cache-backed; Webpack production build passes. Run deployed mobile/Web Vitals check with real media. |
| Accessibility | BLOCKED | Existing controls preserved; complete keyboard, screen-reader, reduced-motion and responsive browser QA against deployment. |
| Responsive | BLOCKED | Requires desktop/tablet/mobile browser/device review. |
| India / Global | BLOCKED | `/global` compatibility remains; approved distinct hostnames are not configured. |
| Media | BLOCKED | No approved asset inventory has been provided or migrated. |
| Caching / revalidation | BLOCKED | Endpoint and authorization boundary exist; needs Strapi webhook with production secret to exercise. |
| Deployment | NOT CONFIGURED | No hosting, DNS, secret manager, database, or provider account is in scope. |
| Rollback | BLOCKED | Runbook defines a safe sequence; actual backup automation must be confirmed by operations. |
| Content | BLOCKED | Matrix identifies missing client-approved copy, media, and configuration. |
| Legal | BLOCKED | Privacy/cookie/legal content requires legal approval. |
