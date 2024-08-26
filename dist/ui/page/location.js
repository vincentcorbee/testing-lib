import { AssertionError } from '../../core/assertions/assertion.error.js';
import { waitForWithResolvers } from '../../shared/wait-for-with-resolvers.js';
export function location(predicateOrProperty, predicate, options) {
    options = arguments[arguments.length - 1];
    return waitForWithResolvers(async (resolve) => {
        const { hash, host, hostname, href, origin, pathname, port, protocol, search } = window.location;
        let actual;
        let expected;
        if (typeof predicateOrProperty === 'function') {
            await predicateOrProperty({ hash, host, hostname, href, origin, pathname, port, protocol, search });
        }
        else {
            if (typeof predicate !== 'object' && predicate !== undefined && typeof predicateOrProperty === 'string') {
                actual = window.location[predicateOrProperty];
                expected = predicate;
            }
            else {
                actual = pathname;
                expected = predicateOrProperty;
            }
            const match = typeof expected === 'string' ? actual === expected : expected.test(actual);
            if (!match)
                throw new AssertionError({
                    name: 'location',
                    expected,
                    actual,
                    pass: false,
                    message: `Expected ${predicateOrProperty} recieved ${pathname}`,
                    context: { name: 'location', type: 'matcher', value: actual, parent: null },
                });
        }
        resolve();
    }, options);
}
//# sourceMappingURL=location.js.map