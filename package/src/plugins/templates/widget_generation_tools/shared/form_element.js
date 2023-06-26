import { makeElement, makeLabel, makeHint } from '../index'

export default function kubikFormField(settings, input, fieldId) {
  const fieldHint = settings.fieldHint
  const fieldLabel = settings.fieldLabel
  const fieldErrors = settings.fieldErrors
  const wrapperAttributes = settings.wrapperAttributes || {}

  const cssClasses = settings.wrapperCssClasses || []


  const fieldWrapper = makeElement('div', [...cssClasses, 'input'], wrapperAttributes)
  const label = makeLabel(fieldId, fieldLabel);
  const hint = makeHint(fieldHint);

  fieldWrapper.appendChild(label)
  fieldWrapper.appendChild(input)
  fieldWrapper.appendChild(hint)

  return fieldWrapper
}


