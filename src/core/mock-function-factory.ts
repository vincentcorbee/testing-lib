import { GenericFunction, MockFunction } from './types.js';

export function noop() {}

export function MockFunctionFactory(
  mockImplementation: GenericFunction = noop,
  intercept?: { object: any; methodName: string },
): MockFunction {
  let calls: any[][] = [];
  let contexts: any[] = [];
  let results: any[] = [];

  const clear = () => {
    calls = [];
    contexts = [];
    results = [];
  };

  const restore = () => {
    clear();

    mockImplementation = noop;

    if (intercept) {
      const { object, methodName } = intercept;

      object[methodName] = original;
    }
  };

  const reset = () => {
    clear();

    mockImplementation = noop;
  };

  let original: GenericFunction;
  let mockFunction: MockFunction;

  const handler: ProxyHandler<MockFunction> = {
    apply(target, thisArg, args) {
      const context = thisArg ?? target;

      calls.push(args);
      contexts.push(context);

      const result = target.call(context, ...args);

      results.push(result);

      return result;
    },
    get(target, prop) {
      if (prop === 'call' || prop === 'apply') return target[prop];

      if (prop === 'mock') {
        return {
          calls: [...calls],
          contexts: [...contexts],
          results: [...results],
        };
      }

      if (prop === 'clear') return clear;

      if (prop === 'reset') return reset;

      if (prop === 'restore') return restore;
    },
  };

  if (intercept) {
    const { object, methodName } = intercept;

    original = object[methodName];

    mockFunction = function (this: MockFunction, ...args: unknown[]): any {
      return mockImplementation.apply(this, [original, ...args]);
    } as MockFunction;

    const proxiedMockFunction = new Proxy(mockFunction as MockFunction, handler);

    object[methodName] = proxiedMockFunction;

    return proxiedMockFunction;
  } else {
    mockFunction = function (this: MockFunction, ...args: unknown[]): any {
      return mockImplementation.call(this, ...args);
    } as MockFunction;

    return new Proxy(mockFunction as MockFunction, handler);
  }
}
