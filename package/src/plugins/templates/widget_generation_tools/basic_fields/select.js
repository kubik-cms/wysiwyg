import { makeElement, kubikFormField } from '../index'

export default function makeSelect(settings) {
  const fieldId = [settings.fieldName, settings.widgetId].join('-')
  const input = makeElement('select', [
    'kubik-wysiwyg--standard-fields--select'
  ], {
    id: fieldId,
    'data-kubik-name': settings.fieldName,
    value: settings.fieldValue,
    'data-action': `${settings.widgetType}#updateField`,
    'data-item-index': settings.itemIndex
  })

  settings.options.forEach((option) => {
    const opt = makeElement('option', [], { value: option.value })
    opt.innerText = option.name
    input.appendChild(opt)
  })

  return kubikFormField(settings, input, fieldId)
}

