import { TestRunner } from "./test-runner.js"
import { consoleLogInterceptor } from './interceptors/console.log.interceptor.js';
import { fetchInterceptor } from './interceptors/fetch.interceptor.js';
import { historyPushStateInterceptor } from './interceptors/history.interceptor.js';
import { xmlHttpRequestOpenInterceptor, xmlHttpRequestSendInterceptor } from './interceptors/xml-http-request.interceptor.js';
import { MockFunctionImplementation, Runner } from "./types.js";

export const testRunner = new TestRunner()

const env = typeof Window === 'function' ? 'browser' : 'node'

testRunner.intercept(globalThis, 'fetch', fetchInterceptor)
testRunner.intercept(console, 'log', consoleLogInterceptor)

if (env === 'browser') {
  testRunner.intercept(XMLHttpRequest.prototype, 'open', xmlHttpRequestOpenInterceptor)
  testRunner.intercept(XMLHttpRequest.prototype, 'send', xmlHttpRequestSendInterceptor)
  testRunner.intercept(history, 'pushState', historyPushStateInterceptor)
}

export function beforeAll(fn) {
  testRunner.beforeAll(fn)
}

export function beforeEach(fn) {
  testRunner.beforeEach(fn)
}

export async function describe(name: string, fn) {
  await testRunner.describe(name, fn)
}

export function test(name: string, fn) {
  testRunner.test(name, fn)
}

Object.defineProperties(test, {
  skip: {
    value: function (name: string, fn) {
      testRunner.test(name, fn, true)
    }
  },
  only: {
    value: function (name: string, fn) {
      testRunner.test(name, fn)
    }
  }
})

export const runner: Runner = {
  mockFunction(mockImplementation?: MockFunctionImplementation) {
    return testRunner.mockFunction(mockImplementation)
  },
  clearAllMock() {
    testRunner.clearAllMock()
  },
  resetAllMock() {
    testRunner.resetAllMock()
  },
  restoreAllMock() {
    testRunner.restoreAllMock()
  }
}