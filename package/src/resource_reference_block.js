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

/**
 * Single database record reference (e.g. Banner picker).
 */
export function defineResourceReferenceBlock({
  toolbox,
  sanitize = {},
  widget_name,
  model,
  adminSearchPath,
  referenceTabName = 'reference',
  referenceFieldName,
  referenceLabel,
  contentFields = [],
  settings = {},
}) {
  const fieldName = referenceFieldName || referenceTabName
  const searchPath = normalizeSearchPath(adminSearchPath)

  const referenceTab = {
    name: referenceTabName,
    label: referenceLabel || model.split('::').pop(),
    fields: [
      {
        name: fieldName,
        label: referenceLabel || model.split('::').pop(),
        model,
        type: 'resource',
        src: searchPath,
      },
    ],
  }

  const tabs = [
    referenceTab,
    presets.contentTab(contentFields),
  ]

  if (settings.layouts?.length || settings.extras?.length) {
    tabs.push(presets.settingsTab(settings))
  }

  return defineBlock({
    toolbox,
    sanitize,
    widgetConfig: {
      widget_name,
      widget_model: model,
      tabs,
    },
  })
}
