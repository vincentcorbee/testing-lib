import { TestRunner } from './test-runner.mjs';

const env = typeof Window === 'function' ? 'browser' : 'node'

globalThis.originalFetch = globalThis.originalFetch || globalThis.fetch

globalThis.fetch = async (...args) => {
  const [url, init = {}] = args
  const { method = 'GET', body } = init

  const { originalFetch } = window;

  const response = await originalFetch(...args);

  requestSubject.next({
    type: 'fetch',
    method,
    url: new URL(url),
    body,
    response,
    status: response.status
  })

  return response;
};

globalThis.originalConsoleLog = globalThis.originalConsoleLog || globalThis.console.log

globalThis.console.log = function(...args) {
  const { originalConsoleLog } = globalThis

  originalConsoleLog.apply(this, args)
}

if (env === 'browser') {
  window.originalXhttpRequestOpen = window.originalXhttpRequestOpen || window.XMLHttpRequest.prototype.open
  window.originalXhttpRequestSend = window.originalXhttpRequestSend || window.XMLHttpRequest.prototype.send

  window.XMLHttpRequest.prototype.open = function(...args) {
    const { originalXhttpRequestOpen } = window
    const [method, url] = args

    this.responseType = 'json'

    this.addEventListener('loadend', function(event) {
      requestSubject.next({
        type: 'xhr',
        method,
        url: new URL(url),
        body: this.body,
        response: this.response,
        status: this.status,
        json: async () => {
            if(this.response instanceof Blob) return JSON.parse(await this.response.text(), null, 2)
            return null
        }
      })
    });

    this.addEventListener('error', function(event) {
      console.log(event)
    });

    return originalXhttpRequestOpen.apply(this, args);
  }

  window.XMLHttpRequest.prototype.send = function(body) {
    this.body = body

    return originalXhttpRequestSend.call(this, body);
  }

  history.originalPushState = history.originalPushState || history.pushState

  history.pushState = function (...args) {
    const [,,url] = args

    navigationSubject.next({
      url
    })

    history.originalPushState.apply(this, args)
  }
}

const testRunner = new TestRunner()

export { expect } from './assertion.mjs'

export async function describe(name, fn) {
  await testRunner.describe(name, fn)
}

export function test(name, fn) {
  testRunner.test(name, fn)
}

Object.defineProperties(test, {
  skip: {
    value: function (name, fn) {
      testRunner.test(name, fn, true)
    }
  },
  only: {
    value: function (name, fn) {
      testRunner.test(name, fn)
    }
  }
})

