import { TestRunner } from './test-runner.js';
import { fetchInterceptor } from './interceptors/fetch.interceptor.js';
import { historyPushStateInterceptor } from './interceptors/history.interceptor.js';
import { xmlHttpRequestOpenInterceptor, xmlHttpRequestSendInterceptor, } from './interceptors/xml-http-request.interceptor.js';
import { env } from '../shared/env.js';
import { getFaker } from '../shared/get-faker.js';
export const testRunner = new TestRunner();
testRunner.intercept(globalThis, 'fetch', fetchInterceptor);
// testRunner.intercept(console, 'log', consoleLogInterceptor)
getFaker().then((faker) => {
    globalThis.faker = faker;
    testRunner.ready();
});
if (env === 'browser') {
    testRunner.intercept(XMLHttpRequest.prototype, 'open', xmlHttpRequestOpenInterceptor);
    testRunner.intercept(XMLHttpRequest.prototype, 'send', xmlHttpRequestSendInterceptor);
    testRunner.intercept(history, 'pushState', historyPushStateInterceptor);
    globalThis.__navigation__ = globalThis.__navigation__ ?? {
        navigate(path) {
            history.pushState({}, '', path);
        },
        back() {
            history.back();
        },
        forward() {
            history.forward();
        },
        go(n) {
            history.go(n);
        },
        reload(path = '/') {
            const currentPath = this.location.pathname;
            history.pushState({}, '', path);
            setTimeout(() => history.pushState({}, '', currentPath));
        },
        get location() {
            return location.pathname;
        },
    };
}
else {
    globalThis.__navigation__ = globalThis.__navigation__ ?? {
        navigate() { },
        back() { },
        forward() { },
        go() { },
        reload() { },
        get location() {
            return '';
        },
    };
}
export function beforeAll(fn) {
    testRunner.beforeAll(fn);
}
export function beforeEach(fn) {
    testRunner.beforeEach(fn);
}
export function afterAll(fn) {
    testRunner.afterAll(fn);
}
export function afterEach(fn) {
    testRunner.afterEach(fn);
}
export async function describe(name, fn) {
    testRunner.describe(name, fn);
    testRunner.currentDescribeBlock = testRunner.currentDescribeBlock.parent ?? testRunner.root;
}
Object.defineProperties(describe, {
    skip: {
        value: function (name, fn) {
            testRunner.describe(name, fn, true);
            testRunner.currentDescribeBlock = testRunner.currentDescribeBlock.parent ?? testRunner.root;
        },
    },
    only: {
        value: function (name, fn) {
            testRunner.describe(name, fn, false, true);
            testRunner.currentDescribeBlock = testRunner.currentDescribeBlock.parent ?? testRunner.root;
        },
    },
});
export function test(name, fn) {
    testRunner.test(name, fn);
}
Object.defineProperties(test, {
    skip: {
        value: function (name, fn) {
            testRunner.test(name, fn, true);
        },
    },
    only: {
        value: function (name, fn) {
            testRunner.test(name, fn, false, true);
        },
    },
});
export const runner = {
    mockFunction(mockImplementation) {
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
    onCompleted(fn) {
        testRunner.on('completed', fn);
    },
    onStarted(fn) {
        testRunner.on('started', fn);
    },
    off(event, fn) {
        testRunner.off(event, fn);
    },
    removeAllListeners() {
        testRunner.removeAllListeners();
    },
};
//# sourceMappingURL=globals.js.map