import type { Core } from '@strapi/strapi';

async function createIfMissing(strapi: Core.Strapi, uid: string, where: Record<string, unknown>, data: Record<string, unknown>) {
  const query = strapi.db.query(uid as never);
  const existing = await query.findOne({ where });
  if (!existing) await query.create({ data });
}

async function configureWebsiteRevalidation(strapi: Core.Strapi) {
  const websiteUrl = process.env.NEXT_APP_URL?.trim();
  const secret = process.env.REVALIDATION_SECRET?.trim();
  if (!websiteUrl && !secret) return;
  if (!websiteUrl || !secret) throw new Error('NEXT_APP_URL and REVALIDATION_SECRET must both be configured to enable website revalidation.');

  const webhookStore = strapi.get('webhookStore');
  const webhookRunner = strapi.get('webhookRunner');
  const url = new URL('/api/revalidate', websiteUrl).toString();
  const settings = {
    name: 'IGAS website cache revalidation',
    url,
    headers: { Authorization: `Bearer ${secret}` },
    events: [
      'entry.create',
      'entry.update',
      'entry.delete',
      'entry.publish',
      'entry.unpublish',
      'media.create',
      'media.update',
      'media.delete',
    ],
    isEnabled: true,
  };
  const existing = (await webhookStore.findWebhooks()).find((webhook: { name?: string }) => webhook.name === settings.name);
  if (existing) {
    const webhook = await webhookStore.updateWebhook(existing.id, settings);
    webhookRunner.update(webhook);
  } else {
    const webhook = await webhookStore.createWebhook(settings);
    webhookRunner.add(webhook);
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
   async bootstrap({ strapi }: { strapi: Core.Strapi }) {
     await configureWebsiteRevalidation(strapi);
     if (process.env.SEED_DEMO_CONTENT !== 'true') return;

    await createIfMissing(strapi, 'api::site-setting.site-setting', { mode: 'india' }, {
      mode: 'india',
      heroEyebrow: '[Demo] Independent advisory',
      heroTitle: '[Demo] A clearer view of what comes next.',
      heroIntro: 'Demo content for validating the Stage 2 CMS integration.',
      heroCta: 'View demo contact',
    });
    await createIfMissing(strapi, 'api::site-setting.site-setting', { mode: 'global' }, {
      mode: 'global',
      heroEyebrow: '[Demo] Global insight',
      heroTitle: '[Demo] Perspective across markets.',
      heroIntro: 'Demo content for validating the Global CMS integration.',
      heroCta: 'View demo thinking',
    });
    await createIfMissing(strapi, 'api::office.office', { slug: 'demo-mumbai' }, { name: '[Demo] Mumbai office', slug: 'demo-mumbai', city: 'Mumbai', country: 'India', mode: 'india', sortOrder: 0 });
    await createIfMissing(strapi, 'api::job.job', { slug: 'demo-consultant' }, { title: '[Demo] Consultant', slug: 'demo-consultant', shortDescription: 'Demo role for CMS validation.', employmentType: 'Full-time', location: 'Demo location', applicationStatus: 'open', mode: 'india', sortOrder: 0 });
    await createIfMissing(strapi, 'api::leadership-profile.leadership-profile', { slug: 'demo-leader' }, { name: '[Demo] Leadership profile', slug: 'demo-leader', position: 'Demo position', mode: 'india', sortOrder: 0 });
    await createIfMissing(strapi, 'api::navigation-item.navigation-item', { label: '[Demo] Home', mode: 'india' }, { label: '[Demo] Home', href: '/', group: '[Demo] Navigation', menuType: 'header', mode: 'india', visible: true, order: 0 });
    await createIfMissing(strapi, 'api::footer.footer', { mode: 'india' }, { mode: 'india', quote: '[Demo] Footer quote', quoteAuthor: 'IGAS demo', signature: '[Demo] Footer signature', newsletterTitle: '[Demo] Newsletter' });
    await createIfMissing(strapi, 'api::page.page', { path: '/demo-stage-2', mode: 'india' }, { path: '/demo-stage-2', mode: 'india', title: '[Demo] Stage 2 page', description: 'Demo page for validating the CMS Page Builder.', sections: [] });
    await createIfMissing(strapi, 'api::page.page', { path: '/about', mode: 'india' }, { path: '/about', mode: 'india', title: 'About IGAS', description: 'Independent thinking for a world that will not stand still.', sections: [{ __component: 'shared.hero', eyebrow: 'About IGAS', title: 'Independent thinking for a world that will not stand still.', intro: 'We are an advisory firm built around the belief that the best answers are both rigorous and human.' }, { __component: 'shared.rich-text', eyebrow: 'Our way of working', title: 'Not just a point of view. A way of working.', body: [{ type: 'paragraph', children: [{ type: 'text', text: 'IGAS works with leaders when the decision matters, the variables are moving and the cost of being vague is high.' }] }, { type: 'paragraph', children: [{ type: 'text', text: 'Our teams bring together strategy, sector depth and the courage to say what we see.' }] }] }] });
    await createIfMissing(strapi, 'api::page.page', { path: '/contact', mode: 'india' }, { path: '/contact', mode: 'india', title: 'Contact IGAS', description: 'Start a conversation about the decision in front of you.', sections: [{ __component: 'shared.contact-form', eyebrow: 'Get in touch', title: 'Let’s talk about what’s next.', intro: 'Tell us a little about the decision in front of you. The right person from our team will be in touch.', consentText: 'I agree to be contacted by IGAS about this enquiry.' }] });
    strapi.log.info('Stage 2 demo content checked without overwriting existing records.');
  },
};
