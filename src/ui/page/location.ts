import { AssertionError } from '../../core/assertions/assertion.error.js';
import { waitForWithResolvers } from '../../shared/wait-for-with-resolvers.js';

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

export type LocationOptions = { timeout?: number };

export function location(predicate: string, options?: LocationOptions): Promise<void>;
export function location(predicate: RegExp, options?: LocationOptions): Promise<void>;
export function location(
  property: keyof Location,
  predicate: string | RegExp,
  options?: LocationOptions,
): Promise<void>;
export function location(
  predicate: (location: Location) => void | Promise<void>,
  options?: LocationOptions,
): Promise<void>;
export function location(
  predicateOrProperty: keyof Location | string | RegExp | ((location: Location) => void | Promise<void>),
  predicate?: string | RegExp | LocationOptions,
  options?: LocationOptions,
): Promise<void> {
  options = arguments[arguments.length - 1] as LocationOptions;

  return waitForWithResolvers<void>(async (resolve) => {
    const { hash, host, hostname, href, origin, pathname, port, protocol, search } = window.location;

    let actual: string;
    let expected: string | RegExp;

    if (typeof predicateOrProperty === 'function') {
      const result = predicateOrProperty({ hash, host, hostname, href, origin, pathname, port, protocol, search });

      if (result instanceof Promise) await result;
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
