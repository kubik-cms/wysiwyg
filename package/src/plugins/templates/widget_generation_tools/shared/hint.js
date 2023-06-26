import { makeElement } from '../index'

export default function(text) {
  return makeElement('p', ['inline-hints'], {}, text)
}


