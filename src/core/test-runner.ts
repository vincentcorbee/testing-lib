import { ConsoleReporter } from '../reporters/console.reporter.js';
import { HTMLReporter } from '../reporters/html.reporter.js';
import { JUnitReporter } from '../reporters/junit.reporter.js';
import { ReporterInterface } from '../reporters/types.js';
import { waitFor } from '../shared/wait-for.js';
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
  ReporterConfig,
  TestBlock,
  TestCallback,
  TestConfig,
  TestResult,
  TestRunnerEvent,
} from './types.js';

const compareFn = (a: any, b: any) => a && b && (a === b || a.toString() === b.toString());

export class TestRunner {
  #describeBlocks: DescribeBlock[];
  root: DescribeBlock;
  currentDescribeBlock: DescribeBlock;
  #shouldSkip: boolean;
  #hasOnly: boolean;
  #testRun: TestRun;
  #isReady: boolean;
  #aborted: boolean;
  #listeners: Map<TestRunnerEvent, Array<(payload?: any) => void>>;
  #reporters: ReporterInterface[];
  #config: TestConfig;

  #mockFunctions: MockFunction[];

  static #createDescribeBlock(
    name: string,
    parent: DescribeBlock | null,
    isRoot = false,
    skip = false,
    only = false,
  ): DescribeBlock {
    const type = isRoot ? 'root' : 'describe';

    return {
      type,
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
      suite: {
        name,
        type,
        parent: parent?.suite ?? null,
        entries: [],
        depth: parent ? parent.suite.depth + 1 : 0,
        isRoot,
      },
    };
  }

  static #createTestBlock(
    name: string,
    fn: TestCallback,
    parent: DescribeBlock,
    skip = false,
    only = false,
  ): TestBlock {
    const testBlock: TestBlock = {
      type: 'test',
      name,
      fn,
      skip,
      only,
      testCase: { type: 'test', name, parent: parent.suite, depth: parent.suite.depth + 1, results: [] },
    };

    parent.blocks.push(testBlock);
    parent.suite.entries.push(testBlock.testCase);

    return testBlock;
  }

  constructor(config: TestConfig = {}) {
    this.#describeBlocks = [];
    this.root = this.currentDescribeBlock = TestRunner.#createDescribeBlock('', null, true);
    this.#shouldSkip = false;
    this.#hasOnly = false;
    this.#testRun = new TestRun(this.root.suite);
    this.#mockFunctions = [];
    this.#isReady = false;
    this.#aborted = false;
    this.#listeners = new Map();
    this.#config = config;
    this.#reporters = this.#getReporters();
  }

  setConfig(config: TestConfig) {
    this.#config = config;

    this.#reporters = this.#getReporters();

    return this;
  }

  on(event: TestRunnerEvent, listener: (...payload: any) => void) {
    const listeners = this.#listeners.get(event);

    if (listeners === undefined) {
      this.#listeners.set(event, [listener]);
    } else if (listeners.every((fn) => !compareFn(fn, listener))) {
      listeners.push(listener);
    }

    return this;
  }

  off(event: TestRunnerEvent, listener: (...payload: any) => void) {
    const listeners = this.#listeners.get(event);

    if (listeners)
      this.#listeners.set(
        event,
        listeners.filter((fn) => !compareFn(fn, listener)),
      );

    return this;
  }

  removeAllListeners() {
    this.#listeners.clear();

    return this;
  }

  ready() {
    this.#isReady = true;
  }

  abort() {
    this.#aborted = true;
  }

  get started() {
    return this.#testRun.started;
  }

  async test(name: string, fn: TestCallback, skip?: boolean, only?: boolean) {
    const { currentDescribeBlock } = this;

    TestRunner.#createTestBlock(
      name,
      fn,
      currentDescribeBlock,
      currentDescribeBlock.skip || skip,
      currentDescribeBlock.only || only,
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
    // @ts-ignore
    currentDescribeBlock.suite.entries.push(name);

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
      If there are no more describe blocks, we have reached the end of the test suite.
    */
    if (describeBlocks.length === 0) {
      root.blocks[index] = describeBlock;
      root.suite.entries[index] = describeBlock.suite;

      await this.#startTestRun();

      this.#reset();
    } else {
      parentDescribeBlock.blocks[index] = describeBlock;
      parentDescribeBlock.suite.entries[index] = describeBlock.suite;
    }
  }

  mockFunction(mockImplementation?: MockFunctionImplementation): MockFunction {
    const mockFunction = MockFunctionFactory(mockImplementation);

    this.#mockFunctions.push(mockFunction);

    return mockFunction;
  }

  spyOn(object: any, methodName: string): MockFunction {
    const mockFunction = MockFunctionFactory(undefined, { object, methodName });

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

  #getReporter(reporter: ReporterConfig) {
    const { name, options } = reporter;

    switch (name) {
      case 'console':
        return new ConsoleReporter();
      case 'html':
        return new HTMLReporter(options);
      case 'junit':
        return new JUnitReporter(options);
      default:
        throw Error('Reporter not found');
    }
  }

  #getReporters() {
    const { reporters = [] } = this.#config;

    if (reporters.length === 0) return [new ConsoleReporter()];

    return reporters.map((reporterConfig) => {
      if (typeof reporterConfig === 'string') return this.#getReporter({ name: reporterConfig });

      if ('name' in reporterConfig) return this.#getReporter(reporterConfig);

      return reporterConfig;
    });
  }

  #reset() {
    this.#reporters.forEach((reporter) => {
      this.off('suite:begin', reporter.onSuiteBegin.bind(reporter));
      this.off('suite:end', reporter.onSuiteEnd.bind(reporter));
      this.off('test:begin', reporter.onTestBegin.bind(reporter));
      this.off('test:end', reporter.onTestEnd.bind(reporter));
      this.off('end', reporter.onEnd.bind(reporter));
      this.off('begin', reporter.onBegin.bind(reporter));
      this.off('error', reporter.onError.bind(reporter));
    });

    this.#describeBlocks = [];
    this.root = this.currentDescribeBlock = TestRunner.#createDescribeBlock('', null, true);
    this.#shouldSkip = false;
    this.#hasOnly = false;
    this.#testRun = new TestRun(this.root.suite);
    this.#mockFunctions = [];
    this.#aborted = false;
    this.#reporters = this.#getReporters();
  }

  #shouldRunTest({ only = false, skip = false }: TestBlock) {
    if (this.#aborted) return false;
    if (this.#shouldSkip) return false;

    if (skip) return false;

    if (this.#hasOnly) return only;

    return true;
  }

  async #startTestRun() {
    await waitFor(() => {
      if (!this.#isReady) throw Error('Test runner is not ready');
    });

    this.#reporters.forEach((reporter) => {
      this.on('suite:begin', reporter.onSuiteBegin.bind(reporter));
      this.on('suite:end', reporter.onSuiteEnd.bind(reporter));
      this.on('test:begin', reporter.onTestBegin.bind(reporter));
      this.on('test:end', reporter.onTestEnd.bind(reporter));
      this.on('end', reporter.onEnd.bind(reporter));
      this.on('begin', reporter.onBegin.bind(reporter));
      this.on('error', reporter.onError.bind(reporter));
    });

    this.#testRun.start();

    this.#emit('begin', this.#testRun.suite);

    await this.#executeDescribe(this.root);

    this.#testRun.stop();

    this.#emit('end', this.#testRun.result);
  }

  async #executeBlocks(blocks: Array<DescribeBlock | TestBlock>, describeBlock: DescribeBlock) {
    for (const block of blocks) {
      const { type } = block;

      if (type === 'describe') await this.#executeDescribe(block);
      if (type === 'test') await this.#executeTest(block, describeBlock);
    }
  }

  async #executeTest(testBlock: TestBlock, describeBlock: DescribeBlock) {
    const testRun = this.#testRun;
    const { fn, testCase } = testBlock;
    const { beforeEachCallbacks, afterEachCallbacks, suite } = describeBlock;

    let testResult: TestResult = {};

    testCase.results.push(testResult);

    this.#emit('test:begin', testCase, testResult);

    if (this.#shouldRunTest(testBlock)) {
      const start = performance.now();

      testResult.start = start;

      try {
        /* Run beforeEach callbacks */
        for (const callback of beforeEachCallbacks) await callback();

        const returnValue = fn();

        if (returnValue instanceof Promise) {
          await returnValue;
        } else if (returnValue !== undefined) {
          throw Error(`${returnValue} is not allowed return value from test function`);
        }

        const end = performance.now();
        const duration = end - start;

        testRun.passed++;

        testResult.status = 'passed';
        testResult.end = end;
        testResult.duration = duration;
      } catch (error: any) {
        const end = performance.now();
        const duration = end - start;

        /* Bail from the test run */
        this.#shouldSkip = true;

        testRun.failed++;

        testResult.error = error;
        testResult.status = 'failed';
        testResult.end = end;
        testResult.duration = duration;
      } finally {
        for (const callback of afterEachCallbacks) await callback();
      }
    } else if (suite.error) {
      /* Pass the error in the suite to first test */

      testResult.error = suite.error;
      testResult.status = 'failed';
      testResult.end = 0;
      testResult.duration = 0;

      suite.error = undefined;
    } else {
      testRun.skipped++;

      testResult.status = 'skipped';
    }

    this.#emit('test:end', testCase, testResult);
  }

  async #executeDescribe(describeBlock: DescribeBlock) {
    const { beforeAllCallbacks, afterAllCallbacks, blocks, suite } = describeBlock;

    this.#emit('suite:begin', suite);

    try {
      for (const callback of beforeAllCallbacks) await callback();

      await this.#executeBlocks(blocks, describeBlock);

      for (const callback of afterAllCallbacks) await callback();
    } catch (error: any) {
      this.#emit('error', error, suite);

      suite.error = error;

      /* Unwind tests */

      this.#shouldSkip = true;

      await this.#executeBlocks(blocks, describeBlock);
    }

    this.#emit('suite:end', suite);
  }

  #emit(event: TestRunnerEvent, ...args: any) {
    const listeners = this.#listeners.get(event);

    if (listeners) listeners.forEach((listener) => listener.call(listener, ...args));
  }
}
