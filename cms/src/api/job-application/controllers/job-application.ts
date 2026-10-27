import type { Core } from '@strapi/strapi';
import { createSubmissionController } from '../../../utils/submission';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  create: createSubmissionController(strapi, true),
});
