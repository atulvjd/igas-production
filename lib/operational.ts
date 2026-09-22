/** Server-only operational helpers. They intentionally never receive form bodies. */
export function requestId(request: Request) {
  return request.headers.get('x-request-id')?.slice(0, 100) || crypto.randomUUID()
}

export function logOperationalEvent(event: string, details: Record<string, string | number | boolean | undefined>) {
  // Keep this allow-listed: no names, emails, messages, file contents, URLs, or secrets.
  console.info(JSON.stringify({ event, timestamp: new Date().toISOString(), ...details }))
}

export async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 10_000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}
