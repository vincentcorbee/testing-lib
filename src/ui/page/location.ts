import { AssertionError } from '../../core/assertions/assertion.error.js';
import { waitFor } from '../../shared/wait-for.js';

export type Location = {
  href: string;
  hash: string;
  host: string;
  hostname: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
};

export function location(predicate: string, options?: { timeout?: number }): Promise<void>;
export function location(predicate: RegExp, options?: { timeout?: number }): Promise<void>;
export function location(
  property: keyof Location,
  predicate: string | RegExp,
  options?: { timeout?: number },
): Promise<void>;
export function location(
  predicate: (location: Location) => void | Promise<void>,
  options?: { timeout?: number },
): Promise<void>;
export function location(
  predicateOrProperty: keyof Location | string | RegExp | ((location: Location) => void | Promise<void>),
  predicate?: string | RegExp | { timeout?: number },
  options?: { timeout?: number },
): Promise<void> {
  options = arguments[arguments.length - 1] as { timeout?: number };

  return waitFor<void>(async (resolve) => {
    const { hash, host, hostname, href, origin, pathname, port, protocol, search } = window.location;

    let actual: string;
    let expected: string | RegExp;

    if (typeof predicateOrProperty === 'function') {
      await predicateOrProperty({ hash, host, hostname, href, origin, pathname, port, protocol, search });
    } else {
      if (typeof predicate !== 'object' && predicate !== undefined && typeof predicateOrProperty === 'string') {
        actual = window.location[predicateOrProperty];
        expected = predicate;
      } else {
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
