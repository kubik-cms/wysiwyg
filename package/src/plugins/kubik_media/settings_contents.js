import { makeElement, makeInput } from '../templates/widget_generation_tools'
export const settingsContents = function settingsContents (data, widgetId) {
  const contents = makeElement('div', ['kubik-wysiwyg--standard-fields'], {
    'data-kubik-widget-settings-target': 'settingsTabContainer'
  })
  const widgetIdValue = widgetId
  const customClass = makeInput({
    widgetId: widgetIdValue,
    fieldName: 'custom_class',
    fieldLabel: 'Custom class',
    fieldHint: 'Block custom class',
    fieldErrors: {},
    inputType: 'text',
    fieldValue: data && data.custom_class ? data.custom_class : '',
    widgetType: 'kubik-widget-settings'
  })
  contents.appendChild(customClass)

  return contents
}
