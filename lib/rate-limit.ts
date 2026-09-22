type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export type RateLimitResult = { allowed: boolean; retryAfter?: number }

/**
 * Per-instance protection suitable for local/single-node deployments. Replace this
 * boundary with an edge or shared-store implementation for multi-instance production.
 */
export function rateLimit(request: Request, scope: string, limit: number, windowMs: number): RateLimitResult {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const identity = forwarded || request.headers.get('x-real-ip') || 'unknown'
  const key = `${scope}:${identity}`
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }
  bucket.count += 1
  if (bucket.count <= limit) return { allowed: true }
  return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
}
