export class MatcherResult {
  constructor(properties = {}) {
    const { name, actual, expected, message, pass = true } = properties

    this.name = name
    this.actual = actual
    this.expected = expected
    this.message = message
    this.pass = pass
  }
}

export class AssertionError extends Error {
  constructor(matcherResultLike) {
    const matcherResult = matcherResultLike instanceof MatcherResult ? matcherResultLike : new MatcherResult(matcherResultLike)

    super(matcherResult.message)

    this.matcherResult = matcherResult
  }

  toJSON() {
    return this.matcherResult
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}

export function expect(actual) {
  const matchers = {
    toEqual: (expected) => {
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
        toEqual: async (expected) => {
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
          catch(error) {
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