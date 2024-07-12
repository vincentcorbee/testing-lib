const env = typeof Window === 'function' ? 'browser' : 'node'

function performAction (action) {
  return new Promise((resolve, reject) => {
    const maxRetries = 5

    let retries = 0

    const perform = async () => {
      try {
        await action(resolve, reject)
      } catch (error) {
        if (retries >= maxRetries) reject(error)
        else {
          retries++
          setTimeout(() => perform(), 500)
        }
      }
    }

    perform()
  })
}

function getFaker() {
  if (env === 'node') {

  } else {
    if (!document.getElementById('faker-js')) {
      const scriptTag = document.createElement('script')

      scriptTag.id = 'faker-js'
      scriptTag.type = 'module'
      scriptTag.innerHTML = `
      import { fakerNL } from 'https://cdn.jsdelivr.net/npm/@faker-js/faker@8.4.1/+esm';
      window.faker = fakerNL;`

      document.head.appendChild(scriptTag)
    }
  }

  return performAction(resolve => {
    if (globalThis.faker) resolve(globalThis.faker)
    else throw Error('Faker not found')
  })
}

// getFaker().then(faker => globalThis.faker = faker)

async function waitForRequest(path, predicate) {
  return new Promise((resolve, reject) => {
    let called = false

    const subscription = requestSubject.subscribe({ next: async data => {
      let called = true

      if(data.url.pathname === path) {
        if (typeof predicate === 'function') {
          const result = await predicate(data)

          if (result === true) resolve(true)
          else {
              reject(Error(`Request not matched: ${path}`))
          }
        } else resolve(true)
      } else reject(Error(`Request not matched: ${path}`))

      subscription.unsubscribe()
    }})

    setTimeout(() => {
      if (!called) {
        subscription.unsubscribe()

        resolve(Error(`Timeout on request: ${path}`))
      }
    }, 3000)
  })
}

async function waitForNavigation(path, timeout = 3000) {
  return new Promise((resolve, reject) => {
    let called = false

    const subscription = navigationSubject.subscribe({ next: async data => {
      called = true

      const match = typeof url === 'string' ? data.url === path : path.test(data.url)

      if(match) resolve(true)
      else reject(Error(`Url not matched: ${path}`))

      subscription.unsubscribe()
    }})

    setTimeout(() => {
      if (!called) {
        subscription.unsubscribe()

        resolve(Error(`Timeout on navigation: ${path}`))
      }
    }, timeout)
  })
}

function dispatchEvent(selectorOrElement, eventType, payload = {}) {
  return performAction((resolve, reject) => {
    const element = typeof selectorOrElement === 'string'
      ? document.querySelector(selectorOrElement)
      : selectorOrElement

    if (!element) throw new AssertionError({ name: 'dispatchEvent', expected: `Element with ${selectorOrElement}`, actual: element, pass: false, message: `${selectorOrElement} not found` })

    let event

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

    if (!event) reject(Error(`Unsupported event $(eventType)`))
    else {
        element.dispatchEvent(event)

        resolve()
    }
  })
}

function getBySelector(selector) {
  return performAction((resolve) => {
    const element = document.querySelector(selector)

    if (!element) throw new AssertionError({ name: 'getBySelector', expected: `Element with ${selector}`, actual: element, pass: false, message: `${text} not found` })

    resolve(element)
  })
}

function getByText(text, options = {}) {
  const parent = typeof options === 'string' ? options : options.parent || '*'

  return performAction(resolve => {
    const result = document.evaluate(`//${parent}[contains(text(),'${text}')]`, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)

    const element = result.iterateNext()

    if (!element) throw new AssertionError({ name: 'getByText', expected: `Element with ${text}`, actual: element, pass: false, message: `${text} not found` })

    resolve(element)
  })
}

const click = (selector) => dispatchEvent(selector, 'click')
const blur = (selector) => dispatchEvent(selector, 'blur')
const keyup = (selector, key) => dispatchEvent(selector, 'keyup', { key })

const setInput = (selectorOrElement, value) => {
  return performAction(async resolve => {
    const element = typeof selectorOrElement === 'string'
      ? document.querySelector(selectorOrElement)
      : selectorOrElement

    if (!element) throw new AssertionError({ name: 'setInput', expected: `Element with ${selectorOrElement}`, actual: element, pass: false, message: `${selectorOrElement} not found` })

    element.focus()

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value').set

    nativeInputValueSetter.call(element, value)

    await dispatchEvent(element, 'change')
    await dispatchEvent(element, 'input')

    resolve()
  })
}

const setSelect = (selectorOrElement, value) => {
  return setInput(selectorOrElement, value)
}

export const screen = {
  getBySelector,
  getByText,
}

export const userEvent = {
  click,
  blur,
  keyup,
  setInput,
  setSelect
}

export const request ={
  waitForRequest,
}

export const navigation ={
  waitForNavigation,
}
