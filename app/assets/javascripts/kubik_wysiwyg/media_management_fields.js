import Wysiwyg from '@kubik-cms/wysiwyg';

const { presets } = Wysiwyg;

const VIDEO_PROVIDER_FIELD_NAMES = new Set(['video_provider']);
const IMAGE_ONLY_VISIBLE_WHEN = { visible_when: { field: 'media_type', eq: 'image' } };

export const mediaLayoutField = {
  name: 'layout',
  label: 'Layout',
  type: 'select',
  section: 'fields',
  include_blank: false,
  default: 'default',
  options: [
    { label: 'Original', value: 'default' },
    { label: 'Full width', value: 'full-width' },
  ],
};

/** Alt, caption, credit, and layout — aligned with Media widget item fields. */
export function mediaItemMetadataFields() {
  return [
    { name: 'alt_text', label: 'Alt text', type: 'text', section: 'fields', ...IMAGE_ONLY_VISIBLE_WHEN },
    { name: 'caption', label: 'Caption', type: 'textarea', section: 'fields', ...IMAGE_ONLY_VISIBLE_WHEN },
    { name: 'credit', label: 'Credit', type: 'text', section: 'fields', ...IMAGE_ONLY_VISIBLE_WHEN },
    mediaLayoutField,
  ];
}

function mapVideoProviderField(field) {
  if (!VIDEO_PROVIDER_FIELD_NAMES.has(field.name)) return field;
  return { ...field, include_blank: false, default: 'youtube' };
}

function contentWithMediaVideoFields(baseFields) {
  return baseFields
    .filter((field) => !['media_type', 'media', 'video_poster_url'].includes(field.name))
    .map(mapVideoProviderField);
}

const videoPosterField = {
  name: 'video_poster_url',
  label: 'Poster image URL',
  type: 'text',
  section: 'fields',
  hint: 'Optional poster frame for stream or self-hosted video.',
  visible_when: { field: 'media_type', eq: 'video' },
};

/** Same image/video controls as the Media widget (single media tab). */
export function mediaManagementFields() {
  const baseFields = presets.mediaTabFields({ mode: 'content_with_media' }).map((field) => {
    if (field.name === 'media_type') {
      return { ...field, include_blank: false, default: 'image' };
    }
    return mapVideoProviderField(field);
  });

  const mediaTypeField = baseFields.find((field) => field.name === 'media_type');
  const imageMediaField = baseFields.find((field) => field.name === 'media');
  const videoFields = contentWithMediaVideoFields(baseFields);

  return [
    mediaTypeField,
    imageMediaField,
    ...videoFields,
    ...mediaItemMetadataFields(),
    videoPosterField,
  ];
}

/** Single media tab (Content with media). */
export function mediaManagementTab() {
  return {
    name: 'media',
    label: 'Media',
    sections: presets.thumbAndFieldsSections(),
    fields: mediaManagementFields(),
  };
}

export default mediaManagementFields;
