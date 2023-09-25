import { makeElement } from './widget_generation_tools'

export const widgetWrapper = function widgetWrapper (details = {}, data) {

  let wrapperAttributes = {
    'data-controller': 'kubik-widget',
    'data-kubik-widget-setup-value': JSON.stringify(details.setup),
    'data-kubik-widget-data-value': JSON.stringify(data),
    'data-kubik-widget-widget-id-value': details.setup.widget_id,
    'data-kubik-widget-widget-icon': details.setup.config.icon,
    id: details.setup.widget_id
  }

  if(details.items_limit) {
    wrapperAttributes['data-kubik-widget-items-max-items-value'] = details.items_limit
  }

  const wrapper = makeElement(
    'div',
    [
      'kubik_media_wrapper',
      'kubik-wysiwyg-component'
    ],
    wrapperAttributes
  )
  return wrapper
}
