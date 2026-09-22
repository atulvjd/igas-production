# Client Handover

IGAS is a Next.js website with Strapi as the content system. The site keeps safe fallback content if CMS is unavailable; production content is published in Strapi.

In Strapi, editors can create and publish Articles, Services, Industries, Jobs, Offices, Leadership profiles, Navigation items, Footer records, Site Settings, and dynamic-zone Pages. Select the correct India or Global mode, complete title/slug/content/SEO, upload approved media with alt text (and caption if needed), review the draft, then publish. Navigation and footer ordering/visibility are editorial fields; do not change links to unapproved external destinations.

For SEO, use concise title and description fields, set no-index only when intended, and use only approved canonical/OG values. Do not remove legacy image URL fields until the Media Library version is verified on the live page.

Contact enquiries and newsletter subscriptions are sent only through server-side configured providers. Editors cannot view or configure provider secrets. Attachments require approved private storage/delivery and must remain PDF/DOC/DOCX under 5 MB.

Developer/operations access is required for domains, DNS, deployments, secrets, provider setup, database/storage backups, WAF/rate limits, Strapi permissions, cache webhook setup, and rollback. See `docs/PRODUCTION-ENVIRONMENT.md` and `docs/DEPLOYMENT-RUNBOOK.md`.

Current launch blockers are approved client content/media/legal copy, provider credentials, private attachment storage/scanning/retention, hosting/DNS, production database, edge protection, and controlled CMS/browser QA. Do not publish/index until these are completed and the QA checklist is signed off.

## Access and ownership

The client CMS owner requests editor access from the Strapi administrator; editors never receive deployment, database, provider, storage, WAF, DNS or secret-manager access. The operations owner controls deployment and rollback; the CMS owner controls content publishing; editorial/legal approve content and legal pages; the support owner triages site/form incidents with the provider and operations owners. Current named owners and login process are NOT CONFIGURED and must be supplied during launch rehearsal. Never place passwords, API tokens, webhook secrets or recovery codes in this document.
