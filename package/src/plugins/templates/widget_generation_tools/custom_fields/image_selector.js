import { makeElement } from '../index'
import { kubikMediaUploadsModalSrc } from '../../../../admin_paths'

export default function imageSelector(widgetId, fieldName, selectLabel = 'Select image') {

  const imageMediaLibrarySelect = makeElement('div', ['kubik-wysiwyg-component--item-image'], {
    'id': [widgetId, fieldName].join('-'),
    'src': kubikMediaUploadsModalSrc(),
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
