import { absoluteUrl, siteDescription, siteName } from '@/lib/site-url'

export function OrganizationSchema() {
  const data = { '@context': 'https://schema.org', '@type': 'Organization', name: siteName, url: absoluteUrl('/'), description: siteDescription, logo: absoluteUrl('/icon.svg'), sameAs: [] }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; path: string }> }) {
  const data = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path) })) }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
