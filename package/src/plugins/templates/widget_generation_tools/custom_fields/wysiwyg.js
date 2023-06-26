import { makeElement, kubikFormField } from '../index'

export default function makeWysiwygInput(settings) {
  const fieldId = [settings.fieldName, settings.widgetId].join('-')

  const input = makeElement('div', [
    'kubik-wysiwyg--standard-fields--wysiwyg'
  ], {
    contenteditable: true,
    id: fieldId,
    'data-kubik-name': settings.fieldName,
    'data-action': `input->${settings.widgetType}#updateWysiwygField`,
    'data-item-index': settings.itemIndex
  })
  input.innerHTML = settings.fieldValue

  return kubikFormField(settings, input, fieldId)
}
