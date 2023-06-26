import { makeElement } from '../index'

export default function(text) {
  const container = makeElement('div', ['kubik-wysiwyg-component--items-action--more'], { tabindex: 1})
  const moreIcon = makeElement('div', ['material-symbols-outlined', 'kubik-media-gallery--media_item_container--icon', 'kubik-wysiwyg-component--items-action', 'kubik-wysiwyg-component--items-action--icon'], { }, 'more_horiz')
  const actionsContainer = makeElement('div', ['kubik-wysiwyg-component--items-more-actions'], {})
  const moveUpAction = makeElement('div', [''], {
    'data-item-index': '',
    'data-action': 'click->kubik-widget-items#moveItemUp',
  })
  const moveUpActionIcon = makeElement('div', [
    'kubik-wysiwyg-component--items-more-action--icon',
    'kubik-wysiwyg-component--items-action',
    'material-symbols-outlined'
  ], {
  }, 'arrow_upward')
  const moveUpActionText = makeElement('div', ['kubik-wysiwyg-component--items-more-action--text'], {}, 'Move up')
  const moveDownAction = makeElement('div', ['kubik-wysiwyg-component--items-more-action'], {
    'data-item-index': '',
    'data-action': 'click->kubik-widget-items#moveItemDown'
  })
  const moveDownActionIcon = makeElement('div', [
    'kubik-wysiwyg-component--items-more-action--icon',
    'kubik-wysiwyg-component--items-action',
    'material-symbols-outlined'
  ], {
  }, 'arrow_downward')
  const moveDownActionText = makeElement('div', ['kubik-wysiwyg-component--items-more-action--text'], {}, 'Move down')
  moveUpAction.appendChild(moveUpActionIcon)
  moveUpAction.appendChild(moveUpActionText)
  moveDownAction.appendChild(moveDownActionIcon)
  moveDownAction.appendChild(moveDownActionText)
  actionsContainer.appendChild(moveUpAction)
  actionsContainer.appendChild(moveDownAction)
  container.appendChild(moreIcon)
  container.appendChild(actionsContainer)
  return container
}
