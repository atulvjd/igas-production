import type { Core } from '@strapi/strapi';
import { storeSubscription, validateSubscription } from '../../../utils/newsletter';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async subscribe(ctx: any) {
    const input = validateSubscription(ctx.request.body?.data);
    if (!input) return ctx.badRequest('A valid email address and newsletter consent are required.');
    const documents = strapi.documents('api::newsletter-subscriber.newsletter-subscriber' as never);
    await storeSubscription({
      find: email => documents.findFirst({ filters: { email } } as never),
      create: data => documents.create({ data } as never),
    }, input);
    // Same response for new, duplicate and opted-out addresses; no subscriber lookup disclosure.
    ctx.body = { ok: true };
  },
});
