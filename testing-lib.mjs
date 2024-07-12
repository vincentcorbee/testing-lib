const env = typeof Window === 'function' ? 'browser' : 'node'

class TestRun {
  skipped
  passed
  failed

  #summary

  constructor() {
    this.passed = 0
    this.failed = 0
    this.skipped = 0
    this.#summary = ''
  }

  get total() {
    return this.passed + this.failed + this.skipped
  }

  get summary() {
    let result = this.#summary

    result += '\n'
    result += this.failed === 0 ? '\x1b[1;42m PASS \x1b[m\n' : '\x1b[1;41m FAIL \x1b[m\n'
    result += '\n\x1b[1mTests\x1b[m: '
    result += `\x1b[1;93m${this.skipped} skipped\x1b[m, `
    result += `\x1b[1;32m${this.passed} passed\x1b[m, `
    result += `\x1b[1;91m${this.failed} failed\x1b[m, `
    result += `\x1b[2m${this.total} total\x1b[m\n`

    return result
  }

  addToSummary(value) {
    this.#summary +=value
  }
}

class TestRunner {
  #describeBlocks
  #root
  #currentDescribeBlock
  #shouldSkip
  #testRun

  static createDescribeBlock(name, isRoot = false) {
    return { name, blocks: new Map(), tests: [], isRoot }
  }

  constructor() {
    this.#describeBlocks = []
    this.#root = this.#currentDescribeBlock = TestRunner.createDescribeBlock('', true)
    this.#shouldSkip = false
    this.#testRun = new TestRun()
  }

  reset() {
    this.#describeBlocks = []
    this.#root = this.#currentDescribeBlock = TestRunner.createDescribeBlock('', true)
    this.#shouldSkip = false
    this.#testRun = new TestRun()
  }

  async #traverseDescribeBlock(describeBlock, indent) {
    const testRun = this.#testRun

    if (!describeBlock.isRoot) testRun.addToSummary(`${' '.repeat(indent)}\x1b[1m${describeBlock.name}\x1b[m\n`)

    const { tests } = describeBlock

    for (const test of tests) {
      const { name, fn, skip = false } = test
      if (!this.#shouldSkip && !skip) {
          try {
          const returnValue = fn()

          if (returnValue instanceof Promise) {
            await returnValue
          } else if(returnValue !== undefined){
            throw Error(`${returnValue} is not allowed return value from test function`)
          }

            testRun.passed++

          testRun.addToSummary(`${' '.repeat(indent + 1)}\x1b[32;1m✓\x1b[m \x1b[90m${name}\x1b[m\n`)
        } catch (error) {
          const errorMessage = `${' '.repeat(indent + 1)}\x1b[91;1m✕\x1b[m \x1b[90m${name}\x1b[m\n\n${' '.repeat(indent + 1)}Expected: \x1b[92;1m"${error.matcherResult.expected}"\n${' '.repeat(indent + 1)}\x1b[mReceived: \x1b[91;1m"${error.matcherResult.actual}"\x1b[m\n\n`

          testRun.addToSummary(`${'-'.repeat(20)}\n`)
          testRun.addToSummary(errorMessage)
          testRun.addToSummary(`${'-'.repeat(20)}\n`)

          this.shouldSkip = true

          testRun.failed++
        }
      } else {
        testRun.skipped++
        testRun.addToSummary(`${' '.repeat(indent + 1)}\x1b[93;1m○\x1b[m \x1b[90m\x1b[1mskipped\x1b[22m: ${name}\x1b[m\n`)
      }
    }

    for (const block of [...describeBlock.blocks.values()]) {
      await this.#traverseDescribeBlock(block, !describeBlock.isRoot ? indent + 1 : indent)
    }
  }

  async test(name, fn, skip = false) {
    this.#currentDescribeBlock.tests.push({ name, fn, skip })
  }

  async describe(name, fn) {
    const newDescribeBlock = TestRunner.createDescribeBlock(name)
    const describeBlocks = this.#describeBlocks
    const root = this.#root

    this.#currentDescribeBlock = newDescribeBlock

    describeBlocks.unshift(newDescribeBlock)

    await fn()

    let index = describeBlocks.length - 1

    while(index >= -1) {
      if (index === -1) break
      if (describeBlocks[index] === newDescribeBlock) break;

      index--
    }

    let parentDescribeBlock

    if (index !== -1) {
      describeBlocks.splice(index, 1)

      parentDescribeBlock = describeBlocks[index] ?? root

    } else {
      parentDescribeBlock = root
    }

    if (describeBlocks.length === 0) {
      root.blocks.set(name, newDescribeBlock)

      await this.#traverseDescribeBlock(root, 0)

      console.log(this.#testRun.summary)
    } else {
      parentDescribeBlock.blocks.set(name, newDescribeBlock)
    }
  }
}

class MatcherResult {
  constructor(properties = {}) {
    const { name, actual, expected, message, pass = true } = properties

    this.name = name
    this.actual = actual
    this.expected = expected
    this.message = message
    this.pass = pass
  }
}

class AssertionError extends Error {
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

class Subscriber {
  #observer
  #completed
  #errored

  constructor(observer) {
    this.#observer = observer;
    this.#completed = false;
    this.#errored = false;
  }

  next(value) {
    try {
      !this.#completed && !this.#errored && this.#observer.next && this.#observer.next(value);
    } catch (error) {
      this.error(error);
    }
  }

  error(error) {
    if (!this.#completed && !this.#errored) {
      this.#errored = true;

      this.#observer.error && this.#observer.error(error);
    }
  }

  complete() {
    if (!this.#completed && !this.#errored) {
      this.#completed = true;

      this.#observer.complete && this.#observer.complete();
    }
  }
}

class Subscription {
  #teardownLogic
  #subscribed

  constructor(teardownLogic = function () {}) {
    this.#teardownLogic = teardownLogic
    this.#subscribed = true
  }

  unsubscribe() {
    if (this.#subscribed) {
      this.#subscribed = false

      this.#teardownLogic()
    }
  }
}

class Subject {
  #subscriptions = new Map()

  next(value) {
    this.#subscriptions.forEach((_, observer) => {
      if (observer.next) observer.next(value);
    });
  }

  error(value) {
    this.#subscriptions.forEach((_, observer) => {
      if (observer.error) observer.error(value);
    });
  }

  completed(value) {
    this.#subscriptions.forEach((_, observer) => {
      if (observer.completed) observer.completed(value);
    });
  }

  subscribe(observer) {
    const subscriber = new Subscriber(observer)
    const subscription = new Subscription(() => this.#subscriptions.delete(subscriber))

    this.#subscriptions.set(subscriber, subscription)

    return subscription
  }
}

const requestSubject = new Subject()
const navigationSubject = new Subject()

globalThis.originalFetch = globalThis.originalFetch || globalThis.fetch

globalThis.fetch = async (...args) => {
  const [url, init = {}] = args
  const { method = 'GET', body } = init

  const { originalFetch } = window;

  const response = await originalFetch(...args);

  requestSubject.next({
    type: 'fetch',
    method,
    url: new URL(url),
    body,
    response,
    status: response.status
  })

  return response;
};

globalThis.originalConsoleLog = globalThis.originalConsoleLog || globalThis.console.log

globalThis.console.log = function(...args) {
  const { originalConsoleLog } = globalThis

  originalConsoleLog.apply(this, args)
}

if (env === 'browser') {
  window.originalXhttpRequestOpen = window.originalXhttpRequestOpen || window.XMLHttpRequest.prototype.open
  window.originalXhttpRequestSend = window.originalXhttpRequestSend || window.XMLHttpRequest.prototype.send

  window.XMLHttpRequest.prototype.open = function(...args) {
    const { originalXhttpRequestOpen } = window
    const [method, url] = args

    this.responseType = 'json'

    this.addEventListener('loadend', function(event) {
      requestSubject.next({
        type: 'xhr',
        method,
        url: new URL(url),
        body: this.body,
        response: this.response,
        status: this.status,
        json: async () => {
            if(this.response instanceof Blob) return JSON.parse(await this.response.text(), null, 2)
            return null
        }
      })
    });

    this.addEventListener('error', function(event) {
      console.log(event)
    });

    return originalXhttpRequestOpen.apply(this, args);
  }

  window.XMLHttpRequest.prototype.send = function(body) {
    this.body = body

    return originalXhttpRequestSend.call(this, body);
  }

  history.originalPushState = history.originalPushState || history.pushState

  history.pushState = function (...args) {
    const [,,url] = args

    navigationSubject.next({
      url
    })

    history.originalPushState.apply(this, args)
  }
}

const testRunner = new TestRunner()

async function describe(name, fn) {
  await testRunner.describe(name, fn)
}

function test(name, fn) {
  testRunner.test(name, fn)
}

Object.defineProperties(test, {
  skip: {
    value: function (name, fn) {
      testRunner.test(name, fn, true)
    }
  },
  only: {
    value: function (name, fn) {
      testRunner.test(name, fn)
    }
  }
})

function expect(actual) {
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

export {
  describe,
  test,
  expect,
}