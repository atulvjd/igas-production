import { searchSiteContent } from '@/lib/strapi'
import { modeForHostname } from '@/lib/site-url'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!process.env.STRAPI_URL || !process.env.STRAPI_API_TOKEN) return Response.json({ error: 'Search is not configured.', results: [] }, { status: 503 })
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  if (query.trim().length < 2) return Response.json({ results: [] })
  const host = (await headers()).get('host')
  const mode = searchParams.get('mode') === 'global' ? 'global' : modeForHostname(host, '/')
  try {
    const results = await searchSiteContent(query, mode)
    return Response.json({ results })
  } catch (error) {
    console.error('Site search failed.', error)
    return Response.json({ error: 'Search is temporarily unavailable.', results: [] }, { status: 503 })
  }
}
