export const NEWSLETTER_CONSENT_VERSION = 'newsletter-v1';

export function validateSubscription(input: unknown) {
  if (!input || typeof input !== 'object') return undefined;
  const value = input as Record<string, unknown>;
  const email = typeof value.email === 'string' ? value.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || value.consent !== true) return undefined;
  return { email, consent: true, consentVersion: NEWSLETTER_CONSENT_VERSION, mode: value.mode === 'global' ? 'global' : 'india' };
}

// Never reactivate an unsubscribed address or change existing consent on a duplicate request.
export async function storeSubscription(store: {
  find: (email: string) => Promise<unknown>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
}, input: NonNullable<ReturnType<typeof validateSubscription>>) {
  if (await store.find(input.email)) return;
  try {
    await store.create({ ...input, subscriptionStatus: 'pending', source: 'website-footer', consentAt: new Date().toISOString() });
  } catch (error) {
    // The unique email constraint also handles concurrent signups.
    if (!await store.find(input.email)) throw error;
  }
}
