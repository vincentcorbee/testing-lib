import { TestRunner } from './test-runner.js';
import { fetchInterceptor } from './interceptors/fetch.interceptor.js';
import { historyPushStateInterceptor } from './interceptors/history.interceptor.js';
import {
  xmlHttpRequestOpenInterceptor,
  xmlHttpRequestSendInterceptor,
} from './interceptors/xml-http-request.interceptor.js';
import {
  AfterAllCallback,
  AfterEachCallback,
  BeforeAllCallback,
  BeforeEachCallback,
  DescribeCallback,
  DescribeFunction,
  MockFunctionImplementation,
  Runner,
  TestCallback,
  TestConfig,
  TestFunction,
} from './types.js';
import { env } from '../shared/env.js';
import { getFaker } from '../shared/get-faker.js';
import { navigationBrowser } from './navigation/navigation.browser.js';
import { navigationNode } from './navigation/navigation.node.js';

export const testRunner = new TestRunner();

testRunner.intercept(globalThis, 'fetch', fetchInterceptor);

getFaker().then((faker: any) => {
  globalThis.faker = faker;

  testRunner.ready();
});

export function defineConfig(config: TestConfig) {
  testRunner.setConfig(config);
}

export function beforeAll(fn: BeforeAllCallback) {
  testRunner.beforeAll(fn);
}

export function beforeEach(fn: BeforeEachCallback) {
  testRunner.beforeEach(fn);
}

export function afterAll(fn: AfterAllCallback) {
  testRunner.afterAll(fn);
}

export function afterEach(fn: AfterEachCallback) {
  testRunner.afterEach(fn);
}

async function describe(name: string, fn: DescribeCallback) {
  testRunner.describe(name, fn);

  testRunner.currentDescribeBlock = testRunner.currentDescribeBlock.parent ?? testRunner.root;
}

Object.defineProperties(describe, {
  skip: {
    value: function (name: string, fn: TestCallback) {
      testRunner.describe(name, fn, true);

      testRunner.currentDescribeBlock = testRunner.currentDescribeBlock.parent ?? testRunner.root;
    },
  },
  only: {
    value: function (name: string, fn: TestCallback) {
      testRunner.describe(name, fn, false, true);

      testRunner.currentDescribeBlock = testRunner.currentDescribeBlock.parent ?? testRunner.root;
    },
  },
});

function test(name: string, fn: TestCallback) {
  testRunner.test(name, fn);
}

Object.defineProperties(test, {
  skip: {
    value: function (name: string, fn: TestCallback) {
      testRunner.test(name, fn, true);
    },
  },
  only: {
    value: function (name: string, fn: TestCallback) {
      testRunner.test(name, fn, false, true);
    },
  },
});

const typedTest = test as TestFunction;

const typedDescribe = describe as DescribeFunction;

export { typedTest as test, typedDescribe as describe };

export const runner: Runner = {
  mockFunction(mockImplementation?: MockFunctionImplementation) {
    return testRunner.mockFunction(mockImplementation);
  },
  clearAllMock() {
    testRunner.clearAllMock();
  },
  resetAllMock() {
    testRunner.resetAllMock();
  },
  restoreAllMock() {
    testRunner.restoreAllMock();
  },
  spyOn(object, methodName) {
    return testRunner.spyOn(object, methodName);
  },
  intercept(object, methodName, interceptor) {
    return testRunner.intercept(object, methodName, interceptor);
  },
  abort() {
    testRunner.abort();
  },
  onEnd(fn: (result: string) => void) {
    testRunner.on('end', fn);
  },
  onBegin(fn: () => void) {
    testRunner.on('begin', fn);
  },
  off(event: 'begin' | 'end', fn: (result?: string) => void) {
    testRunner.off(event, fn);
  },
  removeAllListeners() {
    testRunner.removeAllListeners();
  },
  defineConfig(config: TestConfig) {
    testRunner.setConfig(config);
  },
};

globalThis.runner = runner;

if (env === 'browser') {
  testRunner.intercept(XMLHttpRequest.prototype, 'open', xmlHttpRequestOpenInterceptor);
  testRunner.intercept(XMLHttpRequest.prototype, 'send', xmlHttpRequestSendInterceptor);
  testRunner.intercept(history, 'pushState', historyPushStateInterceptor);

  globalThis.__navigation__ = globalThis.__navigation__ ?? navigationBrowser;
} else {
  globalThis.__navigation__ = globalThis.__navigation__ ?? navigationNode;
}
