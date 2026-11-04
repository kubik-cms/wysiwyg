/**
 * Standard widget field definitions for host apps and generators.
 * Compose with presets.contentTab / manualItemsTab / defineBlock.
 */

export const DEFAULT_HEADING_LEVEL_OPTIONS = [
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'h4', label: 'H4' },
  { value: 'h5', label: 'H5' },
  { value: 'h6', label: 'H6' },
]

const DEFAULT_IMAGE_HINT = 'Should be at least 1200px wide and not bigger than 4MB'
const DEFAULT_DOCUMENT_HINT = 'PDF or other downloadable file from the media library'

export function kubikNavigableWysiwygEnabled() {
  const meta = document.querySelector("meta[name='kubik-navigable-wysiwyg']")
  return meta?.content === 'true'
}

export function headingLevelField({
  name = 'header_level',
  label = 'Heading level',
  options = DEFAULT_HEADING_LEVEL_OPTIONS,
  section,
} = {}) {
  const field = {
    name,
    label,
    type: 'select',
    options,
  }
  if (section) field.section = section
  return field
}

/** Title text field plus an optional heading-level select (e.g. listing item titles). */
export function titleWithHeadingLevel({
  titleName = 'title',
  titleLabel = 'Title',
  levelName = 'title_header_level',
  levelLabel = 'Title heading level',
  levels = DEFAULT_HEADING_LEVEL_OPTIONS,
  section,
} = {}) {
  const title = { name: titleName, label: titleLabel, type: 'text' }
  const level = headingLevelField({ name: levelName, label: levelLabel, options: levels, section })
  if (section) title.section = section
  return [title, level]
}

export function imageResourceField({
  name = 'image',
  label = 'Image',
  model = 'Kubik::MediaUpload',
  section = 'thumb',
  hint = DEFAULT_IMAGE_HINT,
  variant = 'media',
} = {}) {
  return {
    name,
    label,
    model,
    type: 'resource',
    section,
    hint,
    variant,
  }
}

export function documentResourceField({
  name = 'document',
  label = 'Document',
  model = 'Kubik::MediaUpload',
  section = 'thumb',
  hint = DEFAULT_DOCUMENT_HINT,
  variant = 'document',
} = {}) {
  return {
    name,
    label,
    model,
    type: 'resource',
    section,
    hint,
    variant,
  }
}

export function urlLinkFields({
  linkName = 'link',
  linkLabel = 'Link URL',
  linkTextName = 'link_text',
  linkTextLabel = 'Link text',
  section,
} = {}) {
  const link = { name: linkName, label: linkLabel, type: 'text' }
  const linkText = { name: linkTextName, label: linkTextLabel, type: 'text' }
  if (section) {
    link.section = section
    linkText.section = section
  }
  return [link, linkText]
}

/**
 * CMS navigable JSON link (requires kubik_navigation + meta kubik-navigable-wysiwyg).
 * Falls back to urlLinkFields when navigable is unavailable.
 */
export function navigableLinkField({
  name = 'nav_link',
  label = 'Link',
  section,
  fallbackToUrl = true,
} = {}) {
  if (!kubikNavigableWysiwygEnabled()) {
    if (!fallbackToUrl) return []
    return urlLinkFields({ linkName: 'link', linkTextName: 'link_text', section })
  }

  const field = {
    name,
    label,
    type: 'navigable_link',
    hint: 'Pick a navigation item or published resource. Stored as structured link data.',
  }
  if (section) field.section = section
  return [field]
}

export function linkFieldsForHost({ section, preferNavigable = 'auto' } = {}) {
  const useNavigable =
    preferNavigable === true || (preferNavigable === 'auto' && kubikNavigableWysiwygEnabled())
  if (useNavigable) {
    return navigableLinkField({ section, fallbackToUrl: true })
  }
  return urlLinkFields({ section })
}

export function dataAttributesRepeater({ section } = {}) {
  const field = {
    name: 'data_attributes',
    label: 'Data attributes',
    type: 'key_value_repeater',
    prefix: 'data',
    fields: ['key', 'value'],
  }
  if (section) field.section = section
  return field
}

export function linksKeyValueRepeater({
  name = 'links',
  label = 'Links',
  prefix = 'link',
  fields = ['text', 'url', 'target', 'style'],
  styleOptions = [],
  hint,
} = {}) {
  const repeater = {
    name,
    label,
    type: 'key_value_repeater',
    prefix,
    fields,
  }
  if (hint) repeater.hint = hint
  if (styleOptions.length > 0) {
    repeater.field_config = {
      style: {
        type: 'select',
        options: styleOptions,
      },
    }
  }
  return repeater
}

export function standardListingItemFields({
  includeDataAttributes = true,
  includeHeadingLevel = false,
  headingLevelOptions = DEFAULT_HEADING_LEVEL_OPTIONS,
  sections,
} = {}) {
  const sectionThumb = sections ? 'thumb' : undefined
  const sectionFields = sections ? 'fields' : undefined

  const titleBlock = includeHeadingLevel
    ? titleWithHeadingLevel({ section: sectionFields, levels: headingLevelOptions })
    : [{ name: 'title', label: 'Title', type: 'text', ...(sectionFields ? { section: sectionFields } : {}) }]

  const fields = [
    imageResourceField({ section: sectionThumb }),
    ...titleBlock,
    { name: 'subtitle', label: 'Subtitle', type: 'text', ...(sectionFields ? { section: sectionFields } : {}) },
    { name: 'alt_text', label: 'Alt text', type: 'text', ...(sectionFields ? { section: sectionFields } : {}) },
    { name: 'caption', label: 'Caption', type: 'textarea', ...(sectionFields ? { section: sectionFields } : {}) },
    { name: 'credit', label: 'Credit', type: 'text', ...(sectionFields ? { section: sectionFields } : {}) },
    { name: 'description', label: 'Description', type: 'textarea', ...(sectionFields ? { section: sectionFields } : {}) },
    ...urlLinkFields({ section: sectionFields }),
  ]

  if (includeDataAttributes) {
    fields.push(dataAttributesRepeater({ section: sectionFields }))
  }

  return fields
}

export function standardListingItemTabConfig(options = {}) {
  const sections = options.sections !== false
  const sectionDefs = sections
    ? [
        { name: 'thumb', classes: 'thumb' },
        { name: 'fields', classes: 'fields' },
      ]
    : undefined

  return {
    sections: sectionDefs,
    fields: standardListingItemFields({ ...options, sections: sections }),
  }
}

export const mediaTypeField = {
  name: 'media_type',
  label: 'Media type',
  type: 'select',
  section: 'fields',
  options: [
    { label: 'Image', value: 'image' },
    { label: 'Video', value: 'video' },
  ],
}

export function mediaTypeSelectField({ types = ['image', 'video'], section = 'fields' } = {}) {
  const labelMap = { image: 'Image', video: 'Video', document: 'Document' }
  return {
    name: 'media_type',
    label: 'Media type',
    type: 'select',
    section,
    options: types.map((value) => ({ label: labelMap[value] || value, value })),
  }
}

export const imageMediaField = {
  name: 'media',
  label: 'Image',
  model: 'Kubik::MediaUpload',
  type: 'resource',
  section: 'thumb',
  hint: 'For image media, or poster frame when using video. At least 1200px wide, max 4MB.',
  variant: 'media',
}

export const videoProviderField = {
  name: 'video_provider',
  label: 'Video source',
  type: 'select',
  section: 'fields',
  hint: 'YouTube and Vimeo accept watch or embed URLs. Stream is for HLS (.m3u8) with Plyr.',
  options: [
    { label: 'YouTube', value: 'youtube' },
    { label: 'Vimeo', value: 'vimeo' },
    { label: 'Stream (HLS)', value: 'stream' },
    { label: 'Other URL', value: 'url' },
  ],
}

export const videoUrlField = {
  name: 'video_url',
  label: 'Video URL',
  type: 'text',
  section: 'fields',
  hint: 'Embed, watch, direct MP4/WebM, or HLS playlist URL.',
}

export const videoPosterField = {
  name: 'video_poster_url',
  label: 'Poster image URL',
  type: 'text',
  section: 'fields',
  hint: 'Optional poster frame for stream or self-hosted video.',
}

export const videoCaptionsField = {
  name: 'video_captions_url',
  label: 'Captions URL (English)',
  type: 'text',
  section: 'fields',
}

export const videoCaptionsScotsField = {
  name: 'video_captions_scots_url',
  label: 'Captions URL (Scots)',
  type: 'text',
  section: 'fields',
}

export const videoFields = [
  videoProviderField,
  videoUrlField,
  videoPosterField,
  videoCaptionsField,
  videoCaptionsScotsField,
]

const videoVisibleWhen = { visible_when: { field: 'media_type', eq: 'video' } }

export const contentWithMediaVideoFields = [
  { ...videoProviderField, ...videoVisibleWhen },
  { ...videoUrlField, ...videoVisibleWhen },
  { ...videoCaptionsField, ...videoVisibleWhen },
  { ...videoCaptionsScotsField, ...videoVisibleWhen },
]

/** Image + optional video fields for media tabs (standalone Media widget vs content-with-media). */
export function mediaTabFields({ mode = 'full' } = {}) {
  if (mode === 'content_with_media') {
    return [mediaTypeField, imageMediaField, ...contentWithMediaVideoFields]
  }
  return [mediaTypeField, imageMediaField, ...videoFields]
}
