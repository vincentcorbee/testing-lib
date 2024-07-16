export function noop() { }
export function MockFunctionFactory(mockImplementation = noop, intercept) {
    let calls = [];
    let contexts = [];
    let results = [];
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
    let original;
    let mockFunction;
    const handler = {
        apply(target, thisArg, args) {
            const context = thisArg ?? target;
            calls.push(args);
            contexts.push(context);
            const result = target.call(context, ...args);
            results.push(result);
            return result;
        },
        get(target, prop) {
            if (prop === 'call' || prop === 'apply')
                return target[prop];
            if (prop === 'mock') {
                return {
                    calls: [...calls],
                    contexts: [...contexts],
                    results: [...results]
                };
            }
            if (prop === 'clear')
                return clear;
            if (prop === 'reset')
                return reset;
            if (prop === 'restore')
                return restore;
        }
    };
    if (intercept) {
        const { object, methodName } = intercept;
        original = object[methodName];
        mockFunction = function (...args) {
            return mockImplementation.apply(this, [original, ...args]);
        };
        const proxiedMockFunction = new Proxy(mockFunction, handler);
        object[methodName] = proxiedMockFunction;
        return proxiedMockFunction;
    }
    else {
        mockFunction = function (...args) {
            return mockImplementation.call(this, ...args);
        };
        return new Proxy(mockFunction, handler);
    }
}
//# sourceMappingURL=mock-function-factory.js.map