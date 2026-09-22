import { errors } from '@strapi/utils'

type PageLifecycleEvent = {
  params: {
    data: Record<string, unknown>
    where?: { id?: number }
  }
}

async function ensurePathModeIsUnique(event: PageLifecycleEvent) {
  const { path, mode } = event.params.data
  if (typeof path !== 'string' || typeof mode !== 'string') return

  const existing = await strapi.db.query('api::page.page').findOne({
    where: {
      path,
      mode,
      ...(event.params.where?.id ? { id: { $ne: event.params.where.id } } : {}),
    },
  })

  if (existing) {
    throw new errors.ApplicationError(`A page already exists for ${path} in ${mode} mode.`)
  }
}

export default {
  beforeCreate: ensurePathModeIsUnique,
  beforeUpdate: ensurePathModeIsUnique,
}
