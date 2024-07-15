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
            calls.push(args);
            contexts.push(thisArg ?? target);
            const result = target.call(target, ...args);
            results.push(result);
            return result;
        },
        get(_target, prop) {
            console.log(prop);
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
            return mockImplementation.apply(object, [original, ...args]);
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