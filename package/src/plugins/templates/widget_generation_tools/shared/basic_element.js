export default function makeElement(tagName, classNames = [], attributes = {}, textContent = '') {
  const el = document.createElement(tagName);

  el.classList.add(...classNames)

  for (const attrName in attributes) {
    el.setAttribute(attrName, attributes[attrName]);
  }

  if(typeof textContent == 'string') { el.innerText = textContent }

  return el;
};


