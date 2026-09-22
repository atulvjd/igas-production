import { revalidatePath } from 'next/cache'
import { logOperationalEvent, requestId } from '@/lib/operational'

export const runtime = 'nodejs'

const isSafePublicPath = (path: string) => /^\/(?:[a-z0-9-]+\/)*[a-z0-9-]*$/.test(path)

export async function POST(request: Request) {
  const correlationId = requestId(request)
  const secret = process.env.REVALIDATION_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    logOperationalEvent('revalidation.rejected', { correlationId, category: 'authorization' })
    return Response.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  try {
    const body = await request.json() as { path?: unknown }
    const path = typeof body.path === 'string' ? body.path : ''
    if (!isSafePublicPath(path)) {
      return Response.json({ error: 'Unsupported path.' }, { status: 400 })
    }
    revalidatePath(path)
    logOperationalEvent('revalidation.completed', { correlationId })
    return Response.json({ ok: true })
  } catch {
    logOperationalEvent('revalidation.failed', { correlationId, category: 'request' })
    return Response.json({ error: 'Invalid revalidation request.' }, { status: 400 })
  }
}
