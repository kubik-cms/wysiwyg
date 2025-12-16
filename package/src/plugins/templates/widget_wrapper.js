import { makeElement } from './widget_generation_tools'

export const widgetWrapper = function widgetWrapper (details = {}, data) {

  let wrapperAttributes = {
    'data-controller': 'kubik-widget',
    'data-kubik-widget-expanded-class': 'kubik-widget__expanded',
    'data-kubik-widget-expanded-value': (JSON.stringify(data.expanded) || false),
    'data-kubik-widget-setup-value': JSON.stringify(details.setup),
    'data-kubik-widget-data-value': JSON.stringify(data),
    'data-kubik-widget-widget-id-value': details.setup.widget_id,
    'data-kubik-widget-widget-icon': details.setup.config.icon,
    'refresh': 'morph',
    id: details.setup.widget_id
  }

  if(details.items_limit) {
    wrapperAttributes['data-kubik-widget-items-max-items-value'] = details.items_limit
  }

  const wrapper = makeElement(
    'turbo-frame',
    [
      'kubik_media_wrapper',
      'kubik-wysiwyg-component',
      details.setup.widget_class
    ],
    wrapperAttributes
  )
  return wrapper
}
