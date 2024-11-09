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
  MockFunctionImplementation,
  Runner,
  TestCallback,
} from './types.js';
import { env } from '../shared/env.js';
import { getFaker } from '../shared/get-faker.js';

export const testRunner = new TestRunner();

testRunner.intercept(globalThis, 'fetch', fetchInterceptor);

getFaker().then((faker: any) => {
  globalThis.faker = faker;

  testRunner.ready();
});

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

export async function describe(name: string, fn: DescribeCallback) {
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

export function test(name: string, fn: TestCallback) {
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
};

if (env === 'browser') {
  testRunner.intercept(XMLHttpRequest.prototype, 'open', xmlHttpRequestOpenInterceptor);
  testRunner.intercept(XMLHttpRequest.prototype, 'send', xmlHttpRequestSendInterceptor);
  testRunner.intercept(history, 'pushState', historyPushStateInterceptor);

  globalThis.__navigation__ = globalThis.__navigation__ ?? {
    navigate(path: string | URL): void {
      history.pushState({}, '', path);
    },
    back() {
      history.back();
    },
    forward() {
      history.forward();
    },
    go(n?: number) {
      history.go(n);
    },
    reload(path: string | URL = '/') {
      const currentPath = this.location.pathname;

      history.pushState({}, '', path);

      setTimeout(() => history.pushState({}, '', currentPath));
    },
    get location() {
      return location.pathname;
    },
  };
} else {
  globalThis.runner = runner;

  globalThis.__navigation__ = globalThis.__navigation__ ?? {
    navigate() {},
    back() {},
    forward() {},
    go() {},
    reload() {},
    get location() {
      return '';
    },
  };
}
