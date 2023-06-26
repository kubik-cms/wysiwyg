import { makeElement, makeInput, makeSelect, imageSelector, makeDeleteAction, makeMoreActions } from '../templates/widget_generation_tools';

export const itemsContents = function itemsContents (widgetName, widgetId) {
  const container = makeElement('div', [], {}, '')

  const contents = makeElement('div', [], {
    'data-kubik-widget-items-target': 'itemsTabContainer'
  })

  const itemTemplateContent = makeElement('div', ['kubik-wysiwyg-component--item-fields'], {})

  const itemTemplate = makeElement('template', [], {
    id: [widgetId, 'template'].join('-'),
    'data-kubik-widget-items-target': 'itemTemplate'
  })
  const itemsContainer = makeElement('div', [], {
    'data-kubik-widget-items-target': 'itemsContainer'
  })

  const addButton = makeElement('div', ['kubik-wysiwyg-component--add-item'],
    {
      'src': '/admin/kubik_media_uploads?modal=true',
      'data-kubik-modal-action': 'return',
      'data-kubik-modal-return-controller': `kubik-widget-items#${widgetId}`,
      'data-action': 'click->kubik-modal#openModal',
      'data-kubik-widget-items-target': 'addButton'
    },
    'Add media'
  )

  const imageAltInput = makeInput({
    widgetId: widgetId,
    itemIndex: '',
    fieldName: 'alt_text',
    fieldLabel: 'Alt text',
    fieldHint: 'Image alt text for accessibility',
    fieldErrors: {},
    inputType: 'text',
    fieldValue: '',
    widgetType: 'kubik-widget-items',
  })

  const imageCaptionInput = makeInput({
    widgetId: widgetId,
    itemIndex: '',
    fieldName: 'caption',
    fieldLabel: 'Caption',
    fieldHint: 'Media caption',
    fieldErrors: {},
    inputType: 'text',
    fieldValue: '',
    widgetType: 'kubik-widget-items',
  })

  const imageCreditInput = makeInput({
    widgetId: widgetId,
    itemIndex: '',
    fieldName: 'credit',
    fieldLabel: 'Media credit',
    fieldHint: 'Author',
    fieldErrors: {},
    inputType: 'text',
    fieldValue: '',
    widgetType: 'kubik-widget-items',
  })

  const mediaTypeSelect = makeSelect({
    widgetId: widgetId,
    itemIndex: '',
    fieldName: 'media_type',
    fieldLabel: 'Media Type',
    fieldHint: 'Type of media',
    fieldErrors: {},
    fieldValue: '',
    widgetType: 'kubik-widget-items',
    options: [
      { name: 'Image', value: 'image' },
      { name: 'Video', value: 'video' },
    ]
  })
  const thumbnailSelector = imageSelector(widgetId, 'image')
  const imageContainer = makeElement('div', ['kubik-wysiwyg-component--item-images'])
  const itemActions = makeElement('div', ['kubik-wysiwyg-component--item-actions'])

  contents.appendChild(itemsContainer)
  contents.appendChild(addButton)

  itemActions.appendChild(makeDeleteAction())
  itemActions.appendChild(makeMoreActions())

  imageContainer.appendChild(itemActions)
  imageContainer.appendChild(thumbnailSelector)

  itemTemplateContent.appendChild(imageContainer)
  itemTemplateContent.appendChild(mediaTypeSelect)
  itemTemplateContent.appendChild(imageAltInput)
  itemTemplateContent.appendChild(imageCaptionInput)
  itemTemplateContent.appendChild(imageCreditInput)

  itemTemplate.content.appendChild(imageContainer)
  itemTemplate.content.appendChild(itemTemplateContent)

  container.appendChild(itemTemplate)
  container.appendChild(contents)

  return container
}
