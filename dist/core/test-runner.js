import { AssertionError } from "./assertions/index.js";
import { MockFunctionFactory } from "./mock-function-factory.js";
import { TestRun } from "./test-run.js";
export class TestRunner {
    #describeBlocks;
    root;
    currentDescribeBlock;
    #shouldSkip;
    #testRun;
    #beforeEachCallbacks;
    #beforeAllCallbacks;
    #mockFunctions;
    static #createDescribeBlock(name, parent, isRoot = false) {
        return { name, blocks: new Map(), tests: [], isRoot, parent };
    }
    constructor() {
        this.#describeBlocks = [];
        this.root = this.currentDescribeBlock = TestRunner.#createDescribeBlock('', null, true);
        this.#shouldSkip = false;
        this.#testRun = new TestRun();
        this.#beforeEachCallbacks = [];
        this.#beforeAllCallbacks = [];
        this.#mockFunctions = [];
    }
    #reset() {
        this.#describeBlocks = [];
        this.root = this.currentDescribeBlock = TestRunner.#createDescribeBlock('', null, true);
        this.#shouldSkip = false;
        this.#testRun = new TestRun();
        this.#beforeAllCallbacks = [];
        this.#beforeEachCallbacks = [];
    }
    async #traverseDescribeBlock(describeBlock, indent = 0) {
        const testRun = this.#testRun;
        const beforeEachCallbacks = this.#beforeEachCallbacks;
        if (!describeBlock.isRoot)
            testRun.addToReport(`${' '.repeat(indent)}\x1b[1m${describeBlock.name}\x1b[m\n`);
        const { tests } = describeBlock;
        if (!testRun.started) {
            testRun.start();
            for (const callback of this.#beforeAllCallbacks) {
                await callback();
            }
        }
        for (const test of tests) {
            const { name, fn, skip = false } = test;
            if (!this.#shouldSkip && !skip) {
                const start = performance.now();
                try {
                    for (const callback of beforeEachCallbacks) {
                        await callback();
                    }
                    const returnValue = fn();
                    if (returnValue instanceof Promise) {
                        await returnValue;
                    }
                    else if (returnValue !== undefined) {
                        throw Error(`${returnValue} is not allowed return value from test function`);
                    }
                    testRun.passed++;
                    testRun.addToReport(`${' '.repeat(indent + 1)}\x1b[32;1m✓\x1b[m \x1b[90m${name}${TestRun.createDurationString(performance.now() - start)}\x1b[m\n`);
                }
                catch (error) {
                    let errorMessage = '';
                    if (error instanceof AssertionError) {
                        testRun.addToReport(`${' '.repeat(indent + 1)}\x1b[91;1m✕\x1b[m \x1b[90m${name}${TestRun.createDurationString(performance.now() - start)}\x1b[m\n\n`);
                        errorMessage += `${' '.repeat(indent + 1)}Expected: \x1b[92;1m"${error.matcherResult.expected}"\n`;
                        errorMessage += `${' '.repeat(indent + 1)}\x1b[mReceived: \x1b[91;1m"${error.matcherResult.actual}"\x1b[m\n`;
                    }
                    else {
                        errorMessage += `${' '.repeat(indent + 1)}${error.message}\n\n`;
                        testRun.addToReport(`${error.stack.split('\n').map((line) => `${' '.repeat(indent + 1)}${line}`).join('\n')}\n`);
                    }
                    let parentDescribeBlock = describeBlock;
                    let trace = `${parentDescribeBlock.name} › `;
                    while (parentDescribeBlock = parentDescribeBlock.parent) {
                        if (parentDescribeBlock.isRoot === false)
                            trace = `${parentDescribeBlock.name} › ${trace}`;
                    }
                    testRun.addToReport(`${' '.repeat(indent + 1)}\x1b[91;1m● ${trace}${name}\x1b[m\n`);
                    testRun.addToReport(`\n`);
                    testRun.addToReport(errorMessage);
                    testRun.addToReport(`\n`);
                    this.#shouldSkip = true;
                    testRun.failed++;
                }
            }
            else {
                testRun.skipped++;
                testRun.addToReport(`${' '.repeat(indent + 1)}\x1b[93;1m○\x1b[m \x1b[90m\x1b[1mskipped\x1b[22m: ${name}\x1b[m\n`);
            }
        }
        for (const block of [...describeBlock.blocks.values()]) {
            await this.#traverseDescribeBlock(block, !describeBlock.isRoot ? indent + 1 : indent);
        }
    }
    get started() {
        return this.#testRun.started;
    }
    async test(name, fn, skip = false) {
        this.currentDescribeBlock.tests.push({ name, fn, skip });
    }
    async describe(name, fn) {
        const newDescribeBlock = TestRunner.#createDescribeBlock(name, this.currentDescribeBlock);
        const describeBlocks = this.#describeBlocks;
        const root = this.root;
        this.currentDescribeBlock = newDescribeBlock;
        describeBlocks.unshift(newDescribeBlock);
        await fn();
        let index = describeBlocks.length - 1;
        while (index >= -1) {
            if (index === -1)
                break;
            if (describeBlocks[index] === newDescribeBlock)
                break;
            index--;
        }
        let parentDescribeBlock;
        if (index !== -1) {
            describeBlocks.splice(index, 1);
            parentDescribeBlock = describeBlocks[index] ?? root;
        }
        else {
            parentDescribeBlock = root;
        }
        if (describeBlocks.length === 0) {
            root.blocks.set(name, newDescribeBlock);
            await this.#traverseDescribeBlock(root, 0);
            this.#testRun.stop();
            console.log(this.#testRun.report);
            this.#reset();
        }
        else {
            parentDescribeBlock.blocks.set(name, newDescribeBlock);
        }
    }
    mockFunction(mockImplementation) {
        const mockFunction = MockFunctionFactory(mockImplementation);
        this.#mockFunctions.push(mockFunction);
        return mockFunction;
    }
    intercept(object, methodName, interceptor) {
        return MockFunctionFactory(interceptor, { object, methodName });
    }
    beforeAll(fn) {
        this.#beforeAllCallbacks.push(fn);
    }
    beforeEach(fn) {
        this.#beforeEachCallbacks.push(fn);
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
//# sourceMappingURL=test-runner.js.map