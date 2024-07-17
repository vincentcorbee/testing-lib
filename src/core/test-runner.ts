import { AssertionError } from "./assertions/index.js"
import { MockFunctionFactory } from "./mock-function-factory.js"
import { TestRun } from "./test-run.js"
import { DescribeBlock, Interceptor, MockFunction, MockFunctionImplementation, Test } from "./types.js"

function formatValue(value: any) {
  let output = ''

  if (typeof value === 'string') output = value
}

export class TestRunner {
  #describeBlocks: DescribeBlock[]
  root: DescribeBlock
  currentDescribeBlock: DescribeBlock
  #shouldSkip: boolean
  #testRun: TestRun
  #beforeEachCallbacks: (() => void | Promise<void>)[]
  #beforeAllCallbacks:  (() => void | Promise<void>)[]
  #started: boolean

  #mockFunctions: MockFunction[]

  static #createDescribeBlock(name: string, parent: DescribeBlock | null, isRoot = false): DescribeBlock {
    return { name, blocks: new Map(), tests: [], isRoot, parent }
  }

  constructor() {
    this.#describeBlocks = []
    this.root = this.currentDescribeBlock = TestRunner.#createDescribeBlock('', null, true)
    this.#shouldSkip = false
    this.#testRun = new TestRun()
    this.#beforeEachCallbacks = []
    this.#beforeAllCallbacks = []
    this.#started = false
    this.#mockFunctions = []
  }

  #reset() {
    this.#describeBlocks = []
    this.root = this.currentDescribeBlock = TestRunner.#createDescribeBlock('', null, true)
    this.#shouldSkip = false
    this.#testRun = new TestRun()
    this.#started = false
    this.#beforeAllCallbacks = []
    this.#beforeEachCallbacks = []
  }

  async #traverseDescribeBlock(describeBlock: DescribeBlock, indent = 0) {
    const testRun = this.#testRun
    const beforeEachCallbacks = this.#beforeEachCallbacks

    if (!describeBlock.isRoot) testRun.addToSummary(`${' '.repeat(indent)}\x1b[1m${describeBlock.name}\x1b[m\n`)

    const { tests } = describeBlock

    if(!this.#started) {
      this.#started = true

      for (const callback of this.#beforeAllCallbacks) {
        await callback()
      }
    }

    for (const test of tests) {
      const { name, fn, skip = false } = test

      if (!this.#shouldSkip && !skip) {
          try {
            for (const callback of beforeEachCallbacks) {
              await callback()
            }

            const returnValue = fn()

            if (returnValue instanceof Promise) {
              await returnValue
            } else if(returnValue !== undefined){
              throw Error(`${returnValue} is not allowed return value from test function`)
            }

            testRun.passed++

          testRun.addToSummary(`${' '.repeat(indent + 1)}\x1b[32;1m✓\x1b[m \x1b[90m${name}\x1b[m\n`)
        } catch (error: any) {
          let errorMessage = ''

          if (error instanceof AssertionError) {
            errorMessage += `${' '.repeat(indent + 1)}\x1b[91;1m✕\x1b[m \x1b[90m${name}\x1b[m\n\n`
            errorMessage += `${' '.repeat(indent + 1)}Expected: \x1b[92;1m"${error.matcherResult.expected}"\n`
            errorMessage += `${' '.repeat(indent + 1)}\x1b[mReceived: \x1b[91;1m"${error.matcherResult.actual}"\x1b[m\n\n`
          } else {
            errorMessage += `${' '.repeat(indent + 1)}${error.message}\n\n`
            testRun.addToSummary(`${error.stack.split('\n').map((line: string) => `${' '.repeat(indent + 1)}${line}`).join('\n')}\n`);
          }

          testRun.addToSummary(`${'-'.repeat(20)}\n`)
          testRun.addToSummary(errorMessage)
          testRun.addToSummary(`${'-'.repeat(20)}\n`)

          this.#shouldSkip = true

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

  async test(name: string, fn: Test['fn'], skip = false) {
    this.currentDescribeBlock.tests.push({ name, fn, skip })
  }

  async describe(name: string, fn) {
    const newDescribeBlock = TestRunner.#createDescribeBlock(name, this.currentDescribeBlock)
    const describeBlocks = this.#describeBlocks
    const root = this.root

    this.currentDescribeBlock = newDescribeBlock

    describeBlocks.unshift(newDescribeBlock)

    await fn()

    let index = describeBlocks.length - 1

    while(index >= -1) {
      if (index === -1) break
      if (describeBlocks[index] === newDescribeBlock) break;

      index--
    }

    let parentDescribeBlock: DescribeBlock

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

      this.#reset()
    } else {
      parentDescribeBlock.blocks.set(name, newDescribeBlock)
    }
  }

  mockFunction(mockImplementation?: MockFunctionImplementation): MockFunction {
    const mockFunction = MockFunctionFactory(mockImplementation)

    this.#mockFunctions.push(mockFunction)

    return mockFunction
  }

  intercept(object: any, methodName: string, interceptor: Interceptor): MockFunction {
    return MockFunctionFactory(interceptor, { object, methodName })
  }

  beforeAll(fn: () => void | Promise<void>) {
    this.#beforeAllCallbacks.push(fn)
  }

  beforeEach(fn: () => void | Promise<void>) {
    this.#beforeEachCallbacks.push(fn)
  }

  clearAllMock() {
    for (const mockFunction of this.#mockFunctions) {
      mockFunction.clear()
    }
  }

  resetAllMock() {
    for (const mockFunction of this.#mockFunctions) {
      mockFunction.reset()
    }
  }

  restoreAllMock() {
    for (const mockFunction of this.#mockFunctions) {
      mockFunction.restore()
    }
  }
}