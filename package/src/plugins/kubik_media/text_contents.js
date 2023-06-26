import { makeElement, makeInput, makeWysiwygInput } from '../templates/widget_generation_tools'
export const textContents = function textContents (data, widgetId) {
  const contents = makeElement('div', ['kubik-wysiwyg--standard-fields'], {
    'data-kubik-widget-content-target': 'textTabContainer'
  })

  const contentTitle = makeInput({
    widgetId: widgetId,
    fieldName: 'title',
    fieldLabel: 'Title',
    fieldHint: 'Block title',
    fieldErrors: {},
    inputType: 'text',
    fieldValue: data && data.title ? data.title : '',
    widgetType: 'kubik-widget-content'
  })

  const contentIntro = makeWysiwygInput({
    widgetId: widgetId,
    fieldName: 'intro',
    fieldLabel: 'Intro',
    fieldHint: 'Block intro',
    fieldErrors: {},
    inputType: 'text',
    fieldValue: data && data.intro ? data.intro : '',
    widgetType: 'kubik-widget-content'
  })

  contents.appendChild(contentTitle)
  contents.appendChild(contentIntro)

  return contents
}
