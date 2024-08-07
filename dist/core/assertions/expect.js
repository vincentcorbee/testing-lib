import { AssertionError } from './assertion.error.js';
function isVisble(element) {
    let target = element;
    while (target) {
        const { display } = getComputedStyle(target);
        if (!document.contains(target) || display === 'none')
            return false;
        const { width, height } = target.getBoundingClientRect();
        if (height === 0 || width === 0) {
            const { parentElement } = target;
            if (parentElement) {
                const { overflow, overflowX, overflowY } = getComputedStyle(parentElement);
                if (overflow === 'hidden')
                    return false;
                if (width !== 0 && overflowX === 'hidden')
                    return false;
                if (height !== 0 && overflowY === 'hidden')
                    return false;
                target = parentElement;
            }
        }
        break;
    }
    return true;
}
function toEqual(actual, expected, parent) {
    switch (parent.name) {
        case 'not':
            if (actual === expected) {
                throw new AssertionError({
                    name: 'toEqual',
                    modifier: 'not',
                    actual,
                    expected,
                    message: `Expected not to equal ${actual}`,
                    pass: false,
                    context: { name: 'toEqual', type: 'matcher', value: actual, parent },
                });
            }
            break;
        default:
            if (actual !== expected) {
                throw new AssertionError({
                    name: 'toEqual',
                    actual,
                    expected,
                    message: `Expected ${expected} recieved ${actual}`,
                    pass: false,
                    context: { name: 'toEqual', type: 'matcher', value: actual, parent },
                });
            }
    }
}
function toBeDefined(actual, parent) {
    switch (parent.name) {
        case 'not':
            if (actual !== undefined) {
                throw new AssertionError({
                    name: 'toBeDefined',
                    modifier: 'not',
                    actual,
                    message: `Expected actual not to be defined`,
                    pass: false,
                    context: { name: 'toBeDefined', type: 'matcher', value: actual, parent },
                });
            }
            break;
        default:
            if (actual === undefined) {
                throw new AssertionError({
                    name: 'toBeDefined',
                    actual,
                    message: `Expected actual to be defined`,
                    pass: false,
                    context: { name: 'toBeDefined', type: 'matcher', value: actual, parent },
                });
            }
    }
}
async function toThrow(actual, expected, parent) {
    return new Promise(async (resolve, reject) => {
        try {
            await actual;
            reject(new AssertionError({
                name: 'toThrow',
                actual: 'Did not throw',
                expected,
                message: `Expected to throw an error`,
                pass: false,
                context: { name: 'toThrow', type: 'matcher', value: actual, parent },
            }));
        }
        catch (error) {
            resolve(undefined);
        }
    });
}
function resolves(actual, parent) {
    const context = { name: 'resolves', type: 'modifier', value: actual, parent };
    return {
        toEqual: async (expected) => {
            toEqual(await actual, expected, context);
        },
    };
}
function rejects(actual, parent) {
    const context = { name: 'rejects', type: 'modifier', value: actual, parent };
    return {
        toThrow: async (expected) => {
            await toThrow(actual, expected, context);
        },
    };
}
function not(actual, parent) {
    const context = { name: 'not', type: 'modifier', value: actual, parent };
    return {
        toEqual: (expected) => {
            toEqual(actual, expected, context);
        },
        toBeDefined: () => {
            toBeDefined(actual, context);
        },
        toBeVisible: () => {
            toBeVisible(actual, context);
        },
    };
}
function toBeVisible(actual, parent) {
    const visible = isVisble(actual);
    switch (parent.name) {
        case 'not':
            if (visible) {
                throw new AssertionError({
                    name: 'toBeVisible',
                    expected: 'hidden',
                    modifier: 'not',
                    actual: 'visible',
                    message: `Expected element not to be visible`,
                    pass: false,
                    context: { name: 'toBeVisible', type: 'matcher', value: actual, parent },
                });
            }
            break;
        default:
            if (!visible) {
                throw new AssertionError({
                    name: 'toBeVisible',
                    expected: 'visible',
                    actual: 'hidden',
                    message: `Expected element to be visible`,
                    pass: false,
                    context: { name: 'toBeVisible', type: 'matcher', value: actual, parent },
                });
            }
    }
    if (!isVisble(actual)) {
        throw new AssertionError({
            name: 'toBeVisible',
            expected: 'visible',
            actual: 'hidden',
            message: `Element is not visible`,
            pass: false,
            context: { name: 'toBeVisible', type: 'matcher', value: actual, parent },
        });
    }
}
export function expect(actual) {
    const context = { name: 'expect', type: 'expect', value: actual, parent: null };
    const matchers = {
        toEqual: (expected) => {
            toEqual(actual, expected, context);
        },
        toBeDefined: () => {
            toBeDefined(actual, context);
        },
        toBeVisible: () => {
            toBeVisible(actual, context);
        },
        get resolves() {
            return resolves(actual, context);
        },
        get rejects() {
            return rejects(actual, context);
        },
        get not() {
            return not(actual, context);
        },
    };
    return matchers;
}
//# sourceMappingURL=expect.js.map