import { revalidatePath, revalidateTag } from 'next/cache'
import { logOperationalEvent, requestId } from '@/lib/operational'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const correlationId = requestId(request)
  const secret = process.env.REVALIDATION_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    logOperationalEvent('revalidation.rejected', { correlationId, category: 'authorization' })
    return Response.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  try {
    revalidateTag('strapi-content', { expire: 0 })
    revalidatePath('/[[...slug]]', 'page')
    revalidatePath('/sitemap.xml')
    logOperationalEvent('revalidation.completed', { correlationId })
    return Response.json({ ok: true })
  } catch {
    logOperationalEvent('revalidation.failed', { correlationId, category: 'request' })
    return Response.json({ error: 'Unable to revalidate CMS content.' }, { status: 500 })
  }
}
