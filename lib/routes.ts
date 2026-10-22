export const builtInStaticRoutes = [
  '/',
  '/global',
  '/about',
  '/leadership',
  '/contact',
  '/services',
  '/industries',
  '/latest-thinking',
  '/articles',
  '/careers',
  '/offices',
] as const

const builtInRouteSet = new Set<string>(builtInStaticRoutes)
const builtInRoutePrefixes = [
  '/services/',
  '/industries/',
  '/latest-thinking/',
  '/articles/',
  '/careers/',
  '/offices/',
  '/leadership/',
]

export function isBuiltInRoute(pathname: string) {
  return builtInRouteSet.has(pathname) || builtInRoutePrefixes.some((prefix) => pathname.startsWith(prefix))
}

export function getSingleSegmentSlug(pathname: string, prefix: string) {
  if (!pathname.startsWith(prefix)) return undefined
  const slug = pathname.slice(prefix.length)
  return slug && !slug.includes('/') ? slug : undefined
}

export function isValidCmsPagePath(pathname: string) {
  return pathname.startsWith('/')
    && !pathname.startsWith('//')
    && !pathname.includes('?')
    && !pathname.includes('#')
    && !pathname.includes('\\')
    && !isBuiltInRoute(pathname)
}
