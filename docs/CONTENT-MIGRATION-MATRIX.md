# Content Migration Matrix

Fallback content remains intentionally available until each row is verified in production.

| Content | Current source | Target source | Status | Owner | Action required |
|---|---|---|---|---|---|
| Homepage and Global homepage | CMS Page / static fallback | CMS Page + Site Settings | B/C | Editor | Enter approved copy and media per mode. |
| About and Contact | CMS Page / static fallback | CMS Page | B/C | Editor | Review copy, contact details, consent text. |
| Services | Service collection / fallback | Service collection | B/C | Practice leads | Complete approved entries, SEO and relationships. |
| Industries | Industry collection / fallback | Industry collection | B/C | Practice leads | Complete approved entries, SEO and relationships. |
| Articles | Article collection / fallback | Article collection | B/C | Editorial | Migrate approved published articles and media. |
| Careers and jobs | Job collection / fallback | Job collection | B/C | HR | Set status, deadline, application destination. |
| Offices | Office collection / fallback | Office collection | B/C | Operations | Provide verified address/contact/location. |
| Leadership | Leadership Profile collection / fallback | Leadership Profile collection | B/C | Leadership/Comms | Approve biography, photo, links. |
| Navigation | Navigation Item collection / fallback | Navigation Item collection | B/C | Editor | Validate path, ordering, visibility and mode. |
| Footer | Footer collection / fallback | Footer collection | B/C | Editor/Legal | Enter approved links and copyright. |
| SEO and OG | CMS SEO / static metadata | CMS SEO | B/C | Editorial | Verify titles, descriptions, canonical and media. |
| Images and documents | URLs/static assets | Strapi Media Library / approved storage | C | Client | Supply approved inventory, alt text and rights. |
| Legal and privacy copy | Static fallback | CMS Page or legal-owned source | E | Legal | Approve jurisdictional language before publishing. |
| Cookie/search UI labels | Application code | Application-owned | B | Product | Retain unless product decision changes behavior. |
| Production domains/providers | Environment unset | Deployment configuration | D | Client/DevOps | Approve domains, provider contracts and secrets. |
