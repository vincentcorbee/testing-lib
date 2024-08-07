import { AssertionError } from './assertions/index.js';
import { MockFunctionFactory } from './mock-function-factory.js';
import { TestRun } from './test-run.js';
import {
  AfterAllCallback,
  AfterEachCallback,
  BeforeAllCallback,
  BeforeEachCallback,
  DescribeBlock,
  DescribeCallback,
  Interceptor,
  MockFunction,
  MockFunctionImplementation,
  TestBlock,
  TestCallback,
} from './types.js';

function formatStacktrace(stack: string, indent: number) {
  return `\x1b[91m${stack
    .split('\n')
    .map((line: string) => `${createIndentation(indent)}${line}`)
    .join('\n')}\x1b[m`;
}

function createReceivedMessage(received: any) {
  return `\x1b[mReceived: \x1b[91;1m"${received}"\x1b[m`;
}

function createExpectedMessage(expected: any, modifier?: string) {
  return `Expected:${modifier ? ` ${modifier}` : ''} \x1b[92;1m"${expected}\x1b[m"`;
}

function createTestMessage(name: string, durationString: string, passed: boolean) {
  const icon = passed ? '\x1b[32;1m✓\x1b[m' : '\x1b[91;1m✕\x1b[m';

  return `${icon} \x1b[90m${name}${durationString ? ` (${durationString})` : ''}\x1b[m`;
}

function createIndentation(indent: number) {
  return ' '.repeat(indent);
}

function createSkippedMessage(name: string) {
  return `\x1b[93;1m○\x1b[m \x1b[90m\x1b[1mskipped\x1b[22m: ${name}\x1b[m`;
}

function createTrace(describeBlock: DescribeBlock, testBlock?: TestBlock) {
  let trace: string[] = [];
  let parentDescribeBlock: DescribeBlock | null = describeBlock;

  if (testBlock) trace.push(testBlock.name);

  while (parentDescribeBlock) {
    if (parentDescribeBlock.isRoot === false) trace.unshift(parentDescribeBlock.name);

    parentDescribeBlock = parentDescribeBlock.parent;
  }

  return `\x1b[91;1m● ${trace.join(' › ')}\x1b[m`;
}

export class TestRunner {
  #describeBlocks: DescribeBlock[];
  root: DescribeBlock;
  currentDescribeBlock: DescribeBlock;
  #shouldSkip: boolean;
  #hasOnly: boolean;
  #testRun: TestRun;

  #mockFunctions: MockFunction[];

  static #createDescribeBlock(
    name: string,
    parent: DescribeBlock | null,
    isRoot = false,
    skip = false,
    only = false,
  ): DescribeBlock {
    return {
      type: 'describe',
      name,
      blocks: [],
      isRoot,
      parent,
      skip: parent?.skip || skip,
      only: parent?.only || only,
      beforeAllCallbacks: [],
      beforeEachCallbacks: [...(parent?.beforeEachCallbacks ?? [])],
      afterAllCallbacks: [],
      afterEachCallbacks: [],
    };
  }

  static #crateTestBlock(name: string, fn: TestCallback, skip = false, only = false): TestBlock {
    return {
      type: 'test',
      name,
      fn,
      skip,
      only,
    };
  }

  constructor() {
    this.#describeBlocks = [];
    this.root = this.currentDescribeBlock = TestRunner.#createDescribeBlock('', null, true);
    this.#shouldSkip = false;
    this.#hasOnly = false;
    this.#testRun = new TestRun();
    this.#mockFunctions = [];
  }

  #reset() {
    this.#describeBlocks = [];
    this.root = this.currentDescribeBlock = TestRunner.#createDescribeBlock('', null, true);
    this.#shouldSkip = false;
    this.#hasOnly = false;
    this.#testRun = new TestRun();
    this.#mockFunctions = [];
  }

  #shouldRunTest({ only = false, skip = false }: TestBlock) {
    if (this.#shouldSkip) return false;

    if (skip) return false;

    if (this.#hasOnly) return only;

    return true;
  }

  async #startTestRun() {
    this.#testRun.start();

    this.#testRun.addToReport(await this.#executeDescribe(this.root, 0));

    this.#testRun.stop();
  }

  #handleError(error: any, indent: number, describeBlock: DescribeBlock, test?: TestBlock) {
    let report = '';
    let errorMessage = '';
    let chain = '';

    if (error instanceof AssertionError) {
      const { matcherResult } = error;
      const { context, expected, actual } = matcherResult;

      if (context && !context.parent) context.parent = { name: 'expect', type: 'expect', value: actual, parent: null };

      chain = matcherResult.chain;

      switch (context?.parent?.name) {
        case 'not':
          errorMessage += `${createIndentation(indent + 1)}${createExpectedMessage(expected, context?.parent?.name)}\n`;
          break;
        default:
          errorMessage += `${createIndentation(indent + 1)}${createExpectedMessage(expected)}\n`;
          errorMessage += `${createIndentation(indent + 1)}${createReceivedMessage(actual)}\n`;
      }
    } else {
      errorMessage += `${createIndentation(indent + 1)}Error message: ${error.message}`;

      report += `${formatStacktrace(error.stack, indent + 1)}\n\n`;
    }

    report += `${createIndentation(indent)}${createTrace(describeBlock, test)}\n`;

    if (chain) report += `\n${createIndentation(indent + 1)}${chain}\n`;

    report += `\n${errorMessage}\n`;

    return report;
  }

  async #executeTest(test: TestBlock, describeBlock: DescribeBlock, indent = 0) {
    const testRun = this.#testRun;
    const { name, fn } = test;
    const { beforeEachCallbacks, afterEachCallbacks } = describeBlock;

    let report = '';

    if (this.#shouldRunTest(test)) {
      const start = performance.now();

      try {
        /* Run beforeEach callbacks */
        for (const callback of beforeEachCallbacks) await callback();

        const returnValue = fn();

        if (returnValue instanceof Promise) {
          await returnValue;
        } else if (returnValue !== undefined) {
          throw Error(`${returnValue} is not allowed return value from test function`);
        }

        testRun.passed++;

        report += `${createIndentation(indent + 1)}${createTestMessage(name, TestRun.createDurationString(performance.now() - start), true)}\n`;
      } catch (error: any) {
        report += `${createIndentation(indent + 1)}${createTestMessage(name, TestRun.createDurationString(performance.now() - start), false)}\n\n`;

        report += this.#handleError(error, indent + 1, describeBlock, test);

        /* Bail from the test run */
        this.#shouldSkip = true;

        testRun.failed++;
      } finally {
        for (const callback of afterEachCallbacks) await callback();
      }
    } else {
      testRun.skipped++;

      report += `${createIndentation(indent + 1)}${createSkippedMessage(name)}\n`;
    }

    return report;
  }

  async #executeBlocks(blocks: Array<DescribeBlock | TestBlock>, describeBlock: DescribeBlock, indent: number) {
    const { isRoot } = describeBlock;

    let describeReport = '';
    let testReport = '';

    for (const block of blocks) {
      const { type } = block;

      if (type === 'describe') describeReport += await this.#executeDescribe(block, isRoot ? indent : indent + 1);

      if (type === 'test') testReport += await this.#executeTest(block, describeBlock, indent);
    }

    return { describeReport, testReport };
  }

  async #executeDescribe(describeBlock: DescribeBlock, indent = 0) {
    const { name: blockName, isRoot, beforeAllCallbacks, afterAllCallbacks, blocks } = describeBlock;

    let report = '';

    if (!isRoot) report += `${createIndentation(indent)}\x1b[1m${blockName}\x1b[m\n`;

    let testReport = '';
    let describeReport = '';

    try {
      for (const callback of beforeAllCallbacks) await callback();

      const reports = await this.#executeBlocks(blocks, describeBlock, indent);

      describeReport += reports.describeReport;
      testReport += reports.testReport;

      for (const callback of afterAllCallbacks) await callback();
    } catch (error: any) {
      report += this.#handleError(error, indent, describeBlock);

      /* Unwind tests for reporting */

      this.#shouldSkip = true;

      const reports = await this.#executeBlocks(blocks, describeBlock, indent);

      describeReport += reports.describeReport;
      testReport += reports.testReport;
    }

    /* Ouput test report before nested describe blocks */
    return report + testReport + describeReport;
  }

  get started() {
    return this.#testRun.started;
  }

  async test(name: string, fn: TestCallback, skip?: boolean, only?: boolean) {
    const { currentDescribeBlock } = this;

    currentDescribeBlock.blocks.push(
      TestRunner.#crateTestBlock(name, fn, currentDescribeBlock.skip || skip, currentDescribeBlock.only || only),
    );

    if (only) this.#hasOnly = true;
  }

  async describe(name: string, fn: DescribeCallback, skip?: boolean, only?: boolean) {
    const { currentDescribeBlock, root } = this;
    const describeBlock = TestRunner.#createDescribeBlock(name, currentDescribeBlock, false, skip, only);
    const describeBlocks = this.#describeBlocks;

    if (only) this.#hasOnly = true;

    this.currentDescribeBlock = describeBlock;

    describeBlocks.unshift(describeBlock);

    const index = currentDescribeBlock.blocks.length;

    // @ts-ignore
    currentDescribeBlock.blocks.push(name);

    await fn();

    describeBlock.afterEachCallbacks.push(...currentDescribeBlock.afterEachCallbacks);

    let i = describeBlocks.length - 1;

    while (i >= -1) {
      if (i === -1) break;
      if (describeBlocks[i] === describeBlock) break;

      i--;
    }

    let parentDescribeBlock: DescribeBlock;

    if (i !== -1) {
      describeBlocks.splice(i, 1);

      parentDescribeBlock = describeBlocks[i] ?? root;
    } else {
      parentDescribeBlock = root;
    }

    /*
      We should have no more describe blocks so we have reached the end of the test suite.
    */
    if (describeBlocks.length === 0) {
      root.blocks[index] = describeBlock;
      // root.blocks.push(describeBlock);

      await this.#startTestRun();

      console.log(this.#testRun.report);

      this.#reset();
    } else {
      parentDescribeBlock.blocks[index] = describeBlock;
    }
  }

  mockFunction(mockImplementation?: MockFunctionImplementation): MockFunction {
    const mockFunction = MockFunctionFactory(mockImplementation);

    this.#mockFunctions.push(mockFunction);

    return mockFunction;
  }

  intercept(object: any, methodName: string, interceptor: Interceptor): MockFunction {
    return MockFunctionFactory(interceptor, { object, methodName });
  }

  beforeAll(fn: BeforeAllCallback) {
    this.currentDescribeBlock.beforeAllCallbacks.push(fn);
  }

  beforeEach(fn: BeforeEachCallback) {
    this.currentDescribeBlock.beforeEachCallbacks.push(fn);
  }

  afterAll(fn: AfterAllCallback) {
    this.currentDescribeBlock.afterAllCallbacks.push(fn);
  }

  afterEach(fn: AfterEachCallback) {
    this.currentDescribeBlock.afterEachCallbacks.push(fn);
  }

  clearAllMock() {
    for (const mockFunction of this.#mockFunctions) {
      mockFunction.clear();
    }
  }

  resetAllMock() {
    for (const mockFunction of this.#mockFunctions) {
      mockFunction.reset();
    }
  }

  restoreAllMock() {
    for (const mockFunction of this.#mockFunctions) {
      mockFunction.restore();
    }
  }
}
