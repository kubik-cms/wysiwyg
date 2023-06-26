import makeInput from "./basic_fields/input"
import makeSelect from "./basic_fields/select"

import makeWysiwygInput from './custom_fields/wysiwyg'
import imageSelector from './custom_fields/image_selector'
import autocompleteInput from './custom_fields/autocomplete_input'

import makeElement from "./shared/basic_element"
import kubikFormField from "./shared/form_element"
import makeHint from "./shared/hint"
import makeLabel from "./shared/label"
import makeDeleteAction from "./shared/delete_action"
import makeMoreActions from "./shared/more_actions"

export default {
  makeInput,
  makeSelect,
  makeWysiwygInput,
  imageSelector,
  autocompleteInput,
  makeElement,
  kubikFormField,
  makeHint,
  makeLabel,
  makeDeleteAction,
  makeMoreActions
}

export { makeInput, makeSelect, imageSelector, autocompleteInput, makeWysiwygInput, makeElement, kubikFormField, makeHint, makeLabel, makeDeleteAction, makeMoreActions }
