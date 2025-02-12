import { isElementVisble } from '../../shared/index.js';
import { ExpectContext, Matchers } from '../types.js';
import { AssertionError } from './assertion.error.js';

function toEqual<T>(actual: T, expected: any, parent: ExpectContext) {
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

function toBeDefined(actual: any, parent: ExpectContext) {
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

async function toThrow(actual: Promise<any>, expected: any | undefined, parent: ExpectContext) {
  return new Promise(async (resolve, reject) => {
    try {
      await actual;

      reject(
        new AssertionError({
          name: 'toThrow',
          actual: 'Did not throw',
          expected,
          message: `Expected to throw an error`,
          pass: false,
          context: { name: 'toThrow', type: 'matcher', value: actual, parent },
        }),
      );
    } catch (error) {
      resolve(undefined);
    }
  });
}

function resolves<T>(actual: Promise<T>, parent: ExpectContext) {
  const context: ExpectContext = { name: 'resolves', type: 'modifier', value: actual, parent };

  return {
    toEqual: async (expected: any) => {
      toEqual(await actual, expected, context);
    },
    get not() {
      return async function () {
        return not(await actual, context);
      };
    },
  };
}

function rejects<T>(actual: Promise<T>, parent: ExpectContext) {
  const context: ExpectContext = { name: 'rejects', type: 'modifier', value: actual, parent };

  return {
    toThrow: async (expected?: string) => {
      await toThrow(actual, expected, context);
    },
  };
}

function not<T>(actual: T, parent: ExpectContext) {
  const context: ExpectContext = { name: 'not', type: 'modifier', value: actual, parent };

  return {
    toEqual: (expected: any) => {
      toEqual(actual, expected, context);
    },
    toBeDefined: () => {
      toBeDefined(actual, context);
    },
    toBeVisible: () => {
      toBeVisible(actual as HTMLElement, context);
    },
  };
}

function toBeVisible<T extends HTMLElement>(actual: T, parent: ExpectContext) {
  const visible = isElementVisble(actual);

  switch (parent.name) {
    case 'not':
      if (visible) {
        throw new AssertionError({
          name: 'toBeVisible',
          expected: 'visible',
          modifier: 'not',
          actual: 'visible',
          message: `Expected element not to be visible`,
          pass: false,
          context: { name: 'toBeVisible', type: 'matcher', value: actual, parent },
        });
      }
      return;
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
}

export function expect<T>(actual: T): Matchers {
  const context: ExpectContext = { name: 'expect', type: 'expect', value: actual, parent: null };

  const matchers = {
    toEqual: (expected: any) => {
      toEqual(actual, expected, context);
    },
    toBeDefined: () => {
      toBeDefined(actual, context);
    },
    toBeVisible: () => {
      toBeVisible(actual as HTMLElement, context);
    },
    get resolves() {
      return resolves(actual as Promise<T>, context);
    },
    get rejects() {
      return rejects(actual as Promise<T>, context);
    },
    get not() {
      return not(actual, context);
    },
  };

  return matchers;
}
