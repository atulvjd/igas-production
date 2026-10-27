export default {
  routes: [{ method: 'POST', path: '/newsletter-subscriptions', handler: 'newsletter-subscriber.subscribe', config: { auth: false, policies: ['global::submission-auth'] } }],
};
