import { errors } from '@strapi/utils'

type PageLifecycleEvent = {
  params: {
    data: Record<string, unknown>
    where?: { id?: number; documentId?: string }
  }
}

async function ensurePathModeIsUnique(event: PageLifecycleEvent) {
  const { data, where } = event.params
  const query = strapi.db.query('api::page.page')
  const current = where?.id || where?.documentId
    ? await query.findOne({ where, select: ['id', 'documentId', 'path', 'mode'] })
    : null
  const path = data.path ?? current?.path
  const mode = data.mode ?? current?.mode
  const documentId = data.documentId ?? current?.documentId
  if (typeof path !== 'string' || typeof mode !== 'string') return

  const existing = await query.findOne({
    where: {
      path,
      mode,
      // Draft and published rows belong to the same Strapi 5 document.
      ...(typeof documentId === 'string' ? { documentId: { $ne: documentId } }
        : where?.id ? { id: { $ne: where.id } } : {}),
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
