import { makeElement } from './widget_generation_tools'
import { itemActions } from './item_actions'

export const itemPreview = function itemPreview(imageData, index, widgetId) {
  const imagePlaceholder = makeElement('div', ['kubik-wysiwyg-component--item-thumb', 'kubik-image-placeholder'])

  const imageMediaContainer = makeElement('div', ['kubik-media-gallery--media_item_container'])
  const actions = itemActions(index, widgetId )

  const imagePreview = makeElement('div', ['kubik-media-gallery--media_item_container--image'])
  const image = makeElement('img', [], { src: imageData.thumb })

  imagePreview.appendChild(image)

  imageMediaContainer.appendChild(imagePreview)

  imagePlaceholder.appendChild(actions)
  imagePlaceholder.appendChild(imageMediaContainer)

  return imagePlaceholder
}
