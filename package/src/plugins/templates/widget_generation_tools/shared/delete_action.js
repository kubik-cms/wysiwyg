import { makeElement } from '../index'

export default function(text) {
  return makeElement('div', [
    'kubik-wysiwyg-component--items-action',
    'kubik-wysiwyg-component--items-action--icon',
    'material-symbols-outlined',
    'kubik-media-gallery--media_item_container--icon'
  ], {
    'data-item-index': '',
    'data-action': 'click->kubik-widget-items#removeItem'
  }, 'close')
}
