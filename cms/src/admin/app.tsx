import { Mail, Briefcase } from '@strapi/icons';
import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: '/responses/enquiries', icon: Mail,
      intlLabel: { id: 'igas.enquiries', defaultMessage: 'Enquiries' },
      permissions: [{ action: 'plugin::content-manager.explorer.read', subject: 'api::enquiry.enquiry' }],
      Component: async () => import('./pages/Enquiries'),
      position: 3,
    });
    app.addMenuLink({
      to: '/responses/job-applications', icon: Briefcase,
      intlLabel: { id: 'igas.job-applications', defaultMessage: 'Job Applications' },
      permissions: [{ action: 'plugin::content-manager.explorer.read', subject: 'api::job-application.job-application' }],
      Component: async () => import('./pages/JobApplications'),
      position: 4,
    });
    app.customFields.register({
      name: 'submission-file', type: 'json',
      intlLabel: { id: 'igas.submission-file', defaultMessage: 'Submitted file' },
      intlDescription: { id: 'igas.submission-file.description', defaultMessage: 'Private CV or enquiry attachment stored with this submission.' },
      components: { Input: async () => import('./components/SubmissionFile') },
    });
  },
  bootstrap(app: StrapiApp) {
    // Hide only the content navigation links; retain the schemas and RBAC permissions.
    app.registerHook('Admin/CM/pages/App/mutate-collection-types-links', ({ ctLinks, ...rest }: { ctLinks: Array<{ uid: string }>; [key: string]: unknown }) => ({
      ...rest,
      ctLinks: ctLinks.filter(link => !['api::enquiry.enquiry', 'api::job-application.job-application'].includes(link.uid)),
    }));
  },
};
