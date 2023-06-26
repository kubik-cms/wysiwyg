import { makeElement } from '../index'

export default function(fieldId, text) {
  return makeElement('label', ['label'], { for: fieldId }, text)
}

