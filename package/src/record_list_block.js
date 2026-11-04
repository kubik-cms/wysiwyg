import { defineBlock } from './define_block'
import { presets } from './block_presets'
import { activeAdminPath } from './admin_paths'

function normalizeSearchPath(adminSearchPath) {
  const base = activeAdminPath().replace(/\/$/, '')
  let path = adminSearchPath.startsWith('/') ? adminSearchPath : `/${adminSearchPath}`
  if (!path.startsWith(base)) {
    path = `${base}${path}`
  }
  if (!path.endsWith('/wysiwyg_search')) {
    path = `${path.replace(/\/$/, '')}/wysiwyg_search`
  }
  return path
}

function defaultRecordItemFields(model, adminSearchPath) {
  return [
    {
      name: 'record',
      label: 'Record',
      model,
      type: 'resource',
      src: normalizeSearchPath(adminSearchPath),
      section: 'thumb',
    },
  ]
}

export function defineRecordListBlock({
  toolbox,
  sanitize = { intro: { br: true } },
  widget_name,
  model,
  adminSearchPath,
  itemFields,
  queries = [],
  layouts = [],
  settingsExtras = [],
  addLabel = 'Add item',
  allowLiveQuery = true,
  allowSnapshot = false,
}) {
  if (!toolbox || !widget_name || !model || !adminSearchPath) {
    throw new Error('defineRecordListBlock requires toolbox, widget_name, model, and adminSearchPath')
  }

  const fields = itemFields || defaultRecordItemFields(model, adminSearchPath)

  return defineBlock({
    toolbox,
    sanitize,
    widgetConfig: {
      widget_name,
      widget_model: model,
      icon: toolbox.icon,
      tabs: [
        presets.recordListItemsTab({
          model,
          adminSearchPath,
          itemFields: fields,
          addLabel,
          queries,
          allowLiveQuery,
          allowSnapshot,
        }),
        presets.contentTab(),
        presets.recordListSettingsTab({
          layouts,
          extras: settingsExtras,
        }),
      ],
    },
  })
}
