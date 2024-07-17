import { AssertionError } from "./assertion.error.js"

export function expect(actual: any) {
  const matchers = {
    toEqual: (expected: any) => {
      if (actual !== expected) {
        throw new AssertionError({
          name: 'toEqual',
          actual: actual,
          expected: expected,
          message: `Expected ${expected} recieved ${actual}`,
          pass: false,
        })
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new AssertionError({
          name: 'toBeDefined',
          actual: actual,
          message: `Recieved ${actual}`,
          pass: false,
        })
      }
    },
    get resolves() {
      return {
        toEqual: async (expected: any) => {
          try {
            const resolvedValue = await actual

            if (resolvedValue !== expected) {
              throw new AssertionError({
                name: 'toEqual',
                actual: resolvedValue,
                expected: expected,
                message: `Expected ${expected} recieved ${resolvedValue}`,
                pass: false,
              })
            }
          }
          catch(error: any) {
            if (error instanceof AssertionError) throw error

            throw new AssertionError({
              name: 'toEqual',
              actual: error,
              expected: expected,
              message: `Expected ${expected} rejected with ${error}`,
              pass: false,
            })
          }
        }
      }
    }
  }

  return matchers
}