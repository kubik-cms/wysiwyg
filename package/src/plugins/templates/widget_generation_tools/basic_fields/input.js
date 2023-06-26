import { makeElement, kubikFormField } from '../index'

export default function makeInput(settings) {
  const fieldId = [settings.fieldName, settings.widgetId].join('-')
  const input = makeElement('input', [], {
    id: fieldId,
    type: settings.inputType,
    value: settings.fieldValue,
    'data-kubik-name': settings.fieldName,
    'data-action': `${settings.widgetType}#updateField`,
    'data-item-index': settings.itemIndex
  })
  return kubikFormField(settings, input, fieldId)
}


