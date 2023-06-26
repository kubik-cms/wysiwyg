import { makeElement, kubikFormField } from '../index'

export default function autocompleteInput(settings) {

  const fieldId = [settings.fieldName, settings.widgetId].join('-')

  const feedback = makeElement('li',
    [
      'kubik-wysiwyg-component--item-autocomplete-feedback',
      'kubik-wysiwyg-component--item-autocomplete-results-list-item'
    ],
    {
      'data-kubik-autocomplete-target': 'feedback',
      'data-kubik-autocomplete-return-controller-value': settings.widgetId
    }
  )

  const inputContainer = makeElement('div',
    ['kubik-wysiwyg-component--item-autocomplete-wrapper']
  )

  const input = makeElement('input',
    ['kubik-wysiwyg-component--item-autocomplete'],
    {
      'id': fieldId,
      'type': 'text',
      'data-item-index': '',
      'data-kubik-autocomplete-target': 'input',
      'data-kubik-autocomplete-src-value': settings.itemsSrc,
      'data-action': 'input->kubik-autocomplete#load keydown->kubik-autocomplete#keyCheck blur->kubik-autocomplete#blur focus->kubik-autocomplete#focus'
    }
  )

  const hiddenInput = makeElement('input',
    [],
    {
      'data-kubik-name': 'author',
      'data-item-index': '',
      'type': 'hidden'
    }
  )

  const resultsList = makeElement('ul',
    ['kubik-wysiwyg-component--item-autocomplete-results-list'],
    {
      'data-kubik-autocomplete-target': 'resultsList'
    }
  )

  const updatedSettings = Object.assign(settings, {
    wrapperCssClasses: ['kubik-autocomplete-wrapper'],
    wrapperAttributes: {
      'data-controller': 'kubik-autocomplete',
      'data-kubik-autocomplete-src-value': '/admin/book_authors',
      'data-kubik-autocomplete-active-class': 'kubik-autocomplete-wrapper__active',
      'data-kubik-autocomplete-fetch-error-class': 'kubik-autocomplete-wrapper__error',
      'data-kubik-autocomplete-loading-class': 'kubik-autocomplete-wrapper__loading',
      'data-kubik-autocomplete-active-result-class': 'kubik-wysiwyg-component--item-autocomplete-results-list-item__active',
      'data-kubik-autocomplete-no-results-class': 'kubik-autocomplete-wrapper__no-results'
    }
  })

  inputContainer.appendChild(input)
  inputContainer.appendChild(resultsList)
  resultsList.appendChild(feedback)
  inputContainer.appendChild(hiddenInput)

  return kubikFormField(updatedSettings, inputContainer, fieldId)
}

