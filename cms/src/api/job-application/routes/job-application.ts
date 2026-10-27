// No read, update or delete endpoints: inboxes are managed only in the admin panel.
export default {
  routes: [{ method: 'POST', path: '/job-applications', handler: 'job-application.create', config: { auth: false, policies: ['global::submission-auth'] } }],
};
