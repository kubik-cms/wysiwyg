import { makeElement } from '../index'

export default function imageSelector(widgetId, fieldName, selectLabel = 'Select image') {

  const imageMediaLibrarySelect = makeElement('div', ['kubik-wysiwyg-component--item-image'], {
    'id': [widgetId, fieldName].join('-'),
    'src': '/admin/kubik_media_uploads?modal=true',
    'data-controller': 'kubik-image-select',
    'data-kubik-modal-header-text': 'Select images',
    'data-kubik-modal-action': 'return',
    'data-kubik-image-select-label-value': selectLabel,
    'data-kubik-image-select-thumb-value': '',
    'data-kubik-modal-return-controller': `kubik-widget-items#${widgetId}`,
    'data-action': 'click->kubik-modal#openModal'
  })

  return imageMediaLibrarySelect
}
