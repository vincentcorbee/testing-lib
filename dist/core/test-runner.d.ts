import { AfterAllCallback, AfterEachCallback, BeforeAllCallback, BeforeEachCallback, DescribeBlock, DescribeCallback, Interceptor, MockFunction, MockFunctionImplementation, TestCallback } from './types.js';
export declare class TestRunner {
    #private;
    root: DescribeBlock;
    currentDescribeBlock: DescribeBlock;
    constructor();
    get started(): boolean;
    test(name: string, fn: TestCallback, skip?: boolean, only?: boolean): Promise<void>;
    describe(name: string, fn: DescribeCallback, skip?: boolean, only?: boolean): Promise<void>;
    mockFunction(mockImplementation?: MockFunctionImplementation): MockFunction;
    intercept(object: any, methodName: string, interceptor: Interceptor): MockFunction;
    beforeAll(fn: BeforeAllCallback): void;
    beforeEach(fn: BeforeEachCallback): void;
    afterAll(fn: AfterAllCallback): void;
    afterEach(fn: AfterEachCallback): void;
    clearAllMock(): void;
    resetAllMock(): void;
    restoreAllMock(): void;
}
