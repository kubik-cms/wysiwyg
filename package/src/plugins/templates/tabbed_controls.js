import { makeElement } from './widget_generation_tools'

export const tabbedControls = function tabbedControls(name, options={}) {
  const tabsName = [name, 'tabs'].join('-')
  const tabsContainer = makeElement('div', ['kubik-wysiwyg-tabs-container'])
  const tabsContent = makeElement('div', ['kubik-wysiwyg-tabs-content'])

  options.forEach( function(option, index) {
    const id = [tabsName, option.key].join('-')
    const label = makeElement('label', ['kubik-wysiwyg-tab-label'], { for: id })
    const opt = makeElement('input', ['kubik-wysiwyg-tab-input'], { id: id, type: 'radio', value: option.key, name: tabsName})
    const contents = option.contents === 'undefined' ?
      makeElement('div') :
      option.contents
    contents.classList.add('kubik-wysiwyg-tab-content')

    if(index === 0) { opt.setAttribute('checked', null) }


    label.innerText = option.label
    tabsContainer.appendChild(opt)
    tabsContainer.appendChild(label)
    tabsContainer.appendChild(contents)
  })
  return tabsContainer
};
