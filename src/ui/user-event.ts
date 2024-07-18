import { AssertionError } from '../core/assertions/index.js'
import { performAction } from '../shared/perform-action.js'

export function fireEvent(selectorOrElement: string | Element, eventType: string, payload = {}) {
  return performAction((resolve, reject) => {
    const element = typeof selectorOrElement === 'string'
      ? document.querySelector(selectorOrElement)
      : selectorOrElement

    if (!element) throw new AssertionError({ name: 'dispatchEvent', expected: `Element with ${selectorOrElement}`, actual: element, pass: false, message: `${selectorOrElement} not found` })

    let event: Event | MouseEvent | FocusEvent | KeyboardEvent | undefined

    switch(eventType) {
      case 'click':
        event = new MouseEvent(eventType, { bubbles: true, ...payload })
        break
      case 'blur':
        event = new FocusEvent(eventType, { bubbles: true, ...payload })
        break;
      case 'change':
      case 'input':
        event = new Event(eventType, { bubbles: true, ...payload})
        break
      case 'keyup':
        event = new KeyboardEvent(eventType, { bubbles: true, ...payload})
        break
      default:
          break
    }

    if (!event) reject(Error(`Unsupported event ${eventType}`))
    else {
        element.dispatchEvent(event)

        resolve()
    }
  })
}

export const click = (selectorOrElement: string | Element) => fireEvent(selectorOrElement, 'click')

export const blur = (selectorOrElement: string | Element) => fireEvent(selectorOrElement, 'blur')

export const keyup = (selectorOrElement: string | Element, key: string) => fireEvent(selectorOrElement, 'keyup', { key })

export function setInput<E extends HTMLInputElement | HTMLSelectElement>(selectorOrElement: string | E, value: any) {
  return performAction(async resolve => {
    const element = typeof selectorOrElement === 'string'
      ? document.querySelector<E>(selectorOrElement)
      : selectorOrElement

    if (!element) throw new AssertionError({ name: 'setInput', expected: `Element with ${selectorOrElement}`, actual: element, pass: false, message: `${selectorOrElement} not found` });

    element.focus()

    /* To trigger event in React */
    const nativeInputValueSetter = Reflect.getOwnPropertyDescriptor(Reflect.getPrototypeOf(element)!, 'value')?.set

    if(nativeInputValueSetter) nativeInputValueSetter.call(element, value)

    await fireEvent(element, 'change')
    await fireEvent(element, 'input')

    resolve()
  })
}

export function setInputFile (selectorOrElement: string | HTMLInputElement, ...files: File[]) {
  return performAction(async resolve => {
    const element = typeof selectorOrElement === 'string'
      ? document.querySelector<HTMLInputElement>(selectorOrElement)
      : selectorOrElement

    if (!element) throw new AssertionError({ name: 'setInputFile', expected: `Element with ${selectorOrElement}`, actual: element, pass: false, message: `${selectorOrElement} not found` })

    const dataTransfer = new DataTransfer();

    files.forEach(file => dataTransfer.items.add(file));

    element.files = dataTransfer.files

    await fireEvent(element, 'change')

    resolve()
  })
}

export function setSelect (selectorOrElement: HTMLSelectElement | string, value: any) {
  return setInput(selectorOrElement, value)
}