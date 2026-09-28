/**
 * Shared tab/field presets for Kubik Editor.js blocks.
 * Host apps compose these in defineBlock({ widgetConfig: { tabs: [...] } }).
 */

export function contentTab(fields = []) {
  return {
    name: 'content',
    label: 'Content',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'intro', label: 'Intro', type: 'textarea' },
      { name: 'link', label: 'Link', type: 'text' },
      { name: 'link_text', label: 'Link text', type: 'text' },
      ...fields,
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
  resourceListSettingsTab,
}
