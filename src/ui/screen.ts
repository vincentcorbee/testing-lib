import { AssertionError } from '../core/assertions/index.js'
import { performAction } from '../shared/perform-action.js'

export function getBySelector(selector: string, options: { container?: Document | HTMLElement } = { container: document }) {
  const { container = document } = options

  return performAction((resolve) => {
    const element = container.querySelector(selector)

    if (!element) throw new AssertionError({ name: 'getBySelector', expected: `Element with ${selector}`, actual: element, pass: false, message: `${selector} not found` })

    resolve(element)
  })
}

export function getByText(text: string, options: string | { parent?: string, container?: Node, index?: number } = { parent: "*", container: document, index: 0 }) {
  const { parent = '*', index = 0, container = document } = typeof options === 'string' ? { parent: options } : options || { }

  return performAction(resolve => {
    const result = document.evaluate(`//${parent}[contains(text(),'${text}')]`, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)

    let element: Node | null

    let i = 0

    while ((element = result.iterateNext())) {
      if (i === index) break;

      i++
    }

    if (!element) throw new AssertionError({ name: 'getByText', expected: `Element with ${text}`, actual: element, pass: false, message: `${text} not found` })

    resolve(element)
  })
}

export function getAllByText(text: string, options: string | { parent?: string, container?: Node } = { parent: '*', container: document }) {
  const { parent = '*', container = document } = typeof options === 'string' ? { parent: options } : options || { }

  return performAction(resolve => {
    const result = document.evaluate(`//${parent}[contains(text(),'${text}')]`, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)

    const elements: Node[] = []

    let element: Node | null

    while ((element = result.iterateNext())) {
      elements.push(element)
    }

    resolve(elements)
  })
}