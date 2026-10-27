import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
        },
      },
    },
  },
  { name: 'strapi::cors', config: { origin: env.array('CORS_ORIGINS', ['http://localhost:3000']) } },
  'strapi::poweredBy',
  'strapi::query',
  { name: 'strapi::body', config: { jsonLimit: '5mb' } },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
