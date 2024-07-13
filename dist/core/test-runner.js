import { AssertionError } from "./assertion.js";
export class TestRun {
    skipped;
    passed;
    failed;
    #summary;
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
        this.#summary = '';
    }
    get total() {
        return this.passed + this.failed + this.skipped;
    }
    get summary() {
        let result = this.#summary;
        result += '\n';
        result += this.failed === 0 ? '\x1b[1;42m PASS \x1b[m\n' : '\x1b[1;41m FAIL \x1b[m\n';
        result += '\n\x1b[1mTests\x1b[m: ';
        result += `\x1b[1;93m${this.skipped} skipped\x1b[m, `;
        result += `\x1b[1;32m${this.passed} passed\x1b[m, `;
        result += `\x1b[1;91m${this.failed} failed\x1b[m, `;
        result += `\x1b[2m${this.total} total\x1b[m\n`;
        return result;
    }
    addToSummary(value) {
        this.#summary += value;
    }
}
export class TestRunner {
    #describeBlocks;
    #root;
    #currentDescribeBlock;
    #shouldSkip;
    #testRun;
    #beforeEachCallbacks;
    #beforeAllCallbacks;
    #started;
    static #createDescribeBlock(name, isRoot = false) {
        return { name, blocks: new Map(), tests: [], isRoot };
    }
    constructor() {
        this.#describeBlocks = [];
        this.#root = this.#currentDescribeBlock = TestRunner.#createDescribeBlock('', true);
        this.#shouldSkip = false;
        this.#testRun = new TestRun();
        this.#beforeEachCallbacks = [];
        this.#beforeAllCallbacks = [];
        this.#started = false;
    }
    #reset() {
        this.#describeBlocks = [];
        this.#root = this.#currentDescribeBlock = TestRunner.#createDescribeBlock('', true);
        this.#shouldSkip = false;
        this.#testRun = new TestRun();
        this.#started = false;
        this.#beforeAllCallbacks = [];
        this.#beforeEachCallbacks = [];
    }
    async #traverseDescribeBlock(describeBlock, indent = 0) {
        const testRun = this.#testRun;
        const beforeEachCallbacks = this.#beforeEachCallbacks;
        if (!describeBlock.isRoot)
            testRun.addToSummary(`${' '.repeat(indent)}\x1b[1m${describeBlock.name}\x1b[m\n`);
        const { tests } = describeBlock;
        for (const test of tests) {
            const { name, fn, skip = false } = test;
            if (!this.#shouldSkip && !skip) {
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
                    testRun.addToSummary(`${' '.repeat(indent + 1)}\x1b[32;1m✓\x1b[m \x1b[90m${name}\x1b[m\n`);
                }
                catch (error) {
                    let errorMessage = '';
                    if (error instanceof AssertionError) {
                        errorMessage = `${' '.repeat(indent + 1)}\x1b[91;1m✕\x1b[m \x1b[90m${name}\x1b[m\n\n${' '.repeat(indent + 1)}Expected: \x1b[92;1m"${error.matcherResult.expected}"\n${' '.repeat(indent + 1)}\x1b[mReceived: \x1b[91;1m"${error.matcherResult.actual}"\x1b[m\n\n`;
                    }
                    testRun.addToSummary(`${'-'.repeat(20)}\n`);
                    testRun.addToSummary(errorMessage);
                    testRun.addToSummary(`${'-'.repeat(20)}\n`);
                    this.#shouldSkip = true;
                    testRun.failed++;
                }
            }
            else {
                testRun.skipped++;
                testRun.addToSummary(`${' '.repeat(indent + 1)}\x1b[93;1m○\x1b[m \x1b[90m\x1b[1mskipped\x1b[22m: ${name}\x1b[m\n`);
            }
        }
        for (const block of [...describeBlock.blocks.values()]) {
            await this.#traverseDescribeBlock(block, !describeBlock.isRoot ? indent + 1 : indent);
        }
    }
    async test(name, fn, skip = false) {
        this.#currentDescribeBlock.tests.push({ name, fn, skip });
    }
    async describe(name, fn) {
        if (!this.#started) {
            for (const callback of this.#beforeAllCallbacks) {
                await callback();
            }
            this.#started = true;
        }
        const newDescribeBlock = TestRunner.#createDescribeBlock(name);
        const describeBlocks = this.#describeBlocks;
        const root = this.#root;
        this.#currentDescribeBlock = newDescribeBlock;
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
            console.log(this.#testRun.summary);
            this.#reset();
        }
        else {
            parentDescribeBlock.blocks.set(name, newDescribeBlock);
        }
    }
    intercept(object, methodName, interceptor) {
        const original = object[methodName];
        object[methodName] = function (...args) {
            return interceptor.apply(object, [original, ...args]);
        };
    }
    beforeAll(fn) {
        this.#beforeAllCallbacks.push(fn);
    }
    beforeEach(fn) {
        this.#beforeEachCallbacks.push(fn);
    }
}
//# sourceMappingURL=test-runner.js.map