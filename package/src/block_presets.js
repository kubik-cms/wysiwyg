/**
 * Shared tab/field presets for Kubik Editor.js blocks.
 * Host apps compose these in defineBlock({ widgetConfig: { tabs: [...] } }).
 */

import * as fieldPresets from './field_presets'
import { linkFieldsForHost } from './field_presets'

export function contentTab(extraFields = [], { links = 'default' } = {}) {
  const linkFields =
    links === 'none'
      ? []
      : links === 'navigable_auto'
        ? linkFieldsForHost()
        : fieldPresets.urlLinkFields()

  return {
    name: 'content',
    label: 'Content',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'intro', label: 'Intro', type: 'textarea' },
      ...linkFields,
      ...extraFields,
    ],
  }
}

export function settingsTab({ layouts = [], extras = [] } = {}) {
  const fields = []
  if (layouts.length > 0) {
    fields.push({
      name: 'layout',
      label: 'Layout',
      type: 'select',
      options: layouts,
    })
  }
  fields.push(
    { name: 'additional_classes', type: 'text', label: 'Additional classes' },
    { name: 'element_id', type: 'text', label: 'Element ID' },
    ...extras,
  )
  return { name: 'settings', label: 'Settings', fields }
}

export function standardSettingsExtras() {
  return [
    {
      name: 'image_loading',
      label: 'Image loading',
      type: 'select',
      options: [
        { value: 'lazy', label: 'Lazy' },
        { value: 'eager', label: 'Eager (above the fold)' },
      ],
    },
    {
      name: 'data_attributes',
      label: 'Data attributes',
      type: 'key_value_repeater',
      prefix: 'data',
      fields: ['key', 'value'],
    },
  ]
}

export function thumbAndFieldsSections() {
  return [
    { name: 'thumb', classes: 'thumb' },
    { name: 'fields', classes: 'fields' },
  ]
}

export function manualItemsTab({
  name = 'items',
  label = 'Items',
  itemFields,
  addLabel = 'Add item',
  summary = 'title',
  sections = thumbAndFieldsSections(),
}) {
  return {
    name,
    label,
    sections,
    fields: itemFields,
    repeated: true,
    repeater_settings: {
      add_label: addLabel,
      summary,
    },
  }
}

function activeAdminPath() {
  return document.querySelector("meta[name='active-admin-path']")?.content || '/admin'
}

function recordListSourceField({ allowLiveQuery = true, allowSnapshot = false }) {
  return {
    name: 'source',
    label: 'Item source',
    type: 'select',
    store_path: 'settings.source',
    options: [
      { value: 'manual', label: 'Hand-picked items (default)' },
      ...(allowLiveQuery ? [{ value: 'live_query', label: 'Live query (updates on each page view)' }] : []),
      ...(allowSnapshot ? [{ value: 'snapshot', label: 'Snapshot (fixed list of IDs)' }] : []),
    ],
  }
}

function recordListQueryFields(queries = []) {
  if (queries.length === 0) return []

  const liveQueryVisible = { tab: 'settings', field: 'source', eq: 'live_query' }

  return [
    {
      name: 'query_key',
      label: 'Query preset',
      type: 'select',
      store_path: 'settings.query_key',
      visible_when: liveQueryVisible,
      options: queries.map((q) => ({
        value: q.value,
        label: q.label,
      })),
    },
    {
      name: 'query_limit',
      label: 'Limit',
      type: 'text',
      store_path: 'settings.query_limit',
      visible_when: liveQueryVisible,
      hint: 'Number of records (e.g. 5)',
    },
    {
      name: 'query_params',
      label: 'Query parameters (JSON)',
      type: 'textarea',
      store_path: 'settings.query_params',
      visible_when: liveQueryVisible,
      hint: 'e.g. {"article_type":"news"}',
    },
  ]
}

export function recordListItemsTab({
  name = 'items',
  label = 'Items',
  model,
  adminSearchPath,
  itemFields,
  addLabel = 'Add item',
  summary = 'record',
  sections = thumbAndFieldsSections(),
  queries = [],
  allowLiveQuery = true,
  allowSnapshot = false,
}) {
  const base = activeAdminPath().replace(/\/$/, '')
  let path = adminSearchPath.startsWith('/') ? adminSearchPath : `/${adminSearchPath}`
  if (!path.startsWith(base)) {
    path = `${base}${path}`
  }
  if (!path.endsWith('/wysiwyg_search')) {
    path = `${path.replace(/\/$/, '')}/wysiwyg_search`
  }

  const fields =
    itemFields ||
    [
      {
        name: 'record',
        label: 'Record',
        model,
        type: 'resource',
        src: path,
        section: 'thumb',
      },
    ]

  const manualTab = manualItemsTab({
    name,
    label,
    itemFields: fields,
    addLabel,
    summary,
    sections,
  })

  return {
    ...manualTab,
    header_fields: [
      recordListSourceField({ allowLiveQuery, allowSnapshot }),
      ...recordListQueryFields(queries),
    ],
    repeater_visible_when: { tab: 'settings', field: 'source', not_eq: 'live_query' },
  }
}

export function recordListSettingsTab({
  layouts = [],
  extras = [],
}) {
  const fields = []

  if (layouts.length > 0) {
    fields.push({
      name: 'layout',
      label: 'Layout',
      type: 'select',
      options: layouts,
    })
  }

  fields.push(
    { name: 'additional_classes', type: 'text', label: 'Additional classes' },
    { name: 'element_id', type: 'text', label: 'Element ID' },
    ...extras,
  )

  return { name: 'settings', label: 'Settings', fields }
}

export function resourceListSettingsTab({
  filterField = 'filter',
  filterLabel = 'Filter',
  filterOptions = [],
  layouts = [],
  extras = [],
}) {
  const fields = []
  if (filterOptions.length > 0) {
    fields.push({
      name: filterField,
      label: filterLabel,
      type: 'select',
      options: filterOptions,
    })
  }
  if (layouts.length > 0) {
    fields.push({
      name: 'layout',
      label: 'Layout',
      type: 'select',
      options: layouts,
    })
  }
  fields.push(
    { name: 'additional_classes', type: 'text', label: 'Additional classes' },
    { name: 'element_id', type: 'text', label: 'Element ID' },
    ...extras,
  )
  return { name: 'settings', label: 'Settings', fields }
}

export const presets = {
  contentTab,
  settingsTab,
  standardSettingsExtras,
  thumbAndFieldsSections,
  manualItemsTab,
  recordListItemsTab,
  recordListSettingsTab,
  resourceListSettingsTab,
  ...fieldPresets,
}
