import { makeElement } from './widget_generation_tools'

const makeKubikIcon = function makeKubikIcon(text, additional_classes = []) {
  const cssClasses = ['material-symbols-outlined', ...additional_classes]
  return makeElement('div', cssClasses, {}, text)
}

export const itemActions = function itemActions(index, widgetId) {
  const actionsPlaceholder = makeElement('div', ['kubik-wysiwyg-component--item-actions'])

  const deleteLink = makeElement('div', [
    'kubik-wysiwyg-component--items-action',
    'kubik-wysiwyg-component--items-action--delete'
  ], {
    'data-action': 'click->kubik-widget-items#removeItem',
    'data-item-index': index
  })

  const moreActions = makeElement('div', [
    'kubik-wysiwyg-component--items-more-actions'
  ],{})

  const moveUpAction = makeElement('div', [
    'kubik-wysiwyg-component--items-more-action'
  ],{
    'data-action': 'click->kubik-widget-items#moveItemUp',
    'data-item-index': index
  })

  const swapImageAction = makeElement('div', [
    'kubik-wysiwyg-component--items-more-action'
  ],{
    'src': '/admin/kubik_media_uploads?modal=true',
    'data-kubik-modal-header-text': 'Select images',
    'data-kubik-modal-action': 'return',
    'data-kubik-modal-return-payload': JSON.stringify({index: index}),
    'data-kubik-modal-return-controller': `kubik-widget-items#${widgetId}`,
    'data-action': 'click->kubik-modal#openModal'
  })

  const moveDownAction = makeElement('div', [
    'kubik-wysiwyg-component--items-more-action'
  ],{
    'data-action': 'click->kubik-widget-items#moveItemDown',
    'data-item-index': index
  })

  const deleteIcon = makeKubikIcon('close', ['kubik-wysiwyg-component--items-action--icon'])
  const moveUpActionIcon = makeKubikIcon('arrow_upward', ['kubik-wysiwyg-component--items-more-action--icon'])
  const moveDownActionIcon = makeKubikIcon('arrow_downward', ['kubik-wysiwyg-component--items-more-action--icon'])
  const swapImageActionIcon = makeKubikIcon('autorenew', ['kubik-wysiwyg-component--items-more-action--icon'])
  const moreIcon = makeKubikIcon('more_horiz', ['kubik-wysiwyg-component--items-action--icon'])

  const moveDownActionText =  makeElement('div', [
    'kubik-wysiwyg-component--items-more-action--text'
  ], {}, 'Move down')

  const moveUpActionText =  makeElement('div', [
    'kubik-wysiwyg-component--items-more-action--text'
  ], {}, 'Move up')

  const swapImageActionText =  makeElement('div', [
    'kubik-wysiwyg-component--items-more-action--text'
  ], {}, 'Swap image')


  moveUpAction.appendChild(moveUpActionIcon)
  moveUpAction.appendChild(moveUpActionText)
  moveDownAction.appendChild(moveDownActionIcon)
  moveDownAction.appendChild(moveDownActionText)
  swapImageAction.appendChild(swapImageActionIcon)
  swapImageAction.appendChild(swapImageActionText)

  moreActions.appendChild(moveUpAction)
  moreActions.appendChild(swapImageAction)
  moreActions.appendChild(moveDownAction)

  const moreLink = makeElement('div', [
    'kubik-wysiwyg-component--items-action',
    'kubik-wysiwyg-component--items-action--more'
  ], {
    'data-item-index': index,
    tabindex: 0
  })

  moreLink.appendChild(moreIcon)
  moreLink.appendChild(moreActions)

  deleteLink.appendChild(deleteIcon)

  actionsPlaceholder.appendChild(deleteLink)
  actionsPlaceholder.appendChild(moreLink)

  return actionsPlaceholder
}
