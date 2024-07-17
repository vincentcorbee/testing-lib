import { DescribeBlock, Interceptor, MockFunction, MockFunctionImplementation, Test } from "./types.js";
export declare class TestRunner {
    #private;
    root: DescribeBlock;
    currentDescribeBlock: DescribeBlock;
    constructor();
    get started(): boolean;
    test(name: string, fn: Test['fn'], skip?: boolean): Promise<void>;
    describe(name: string, fn: any): Promise<void>;
    mockFunction(mockImplementation?: MockFunctionImplementation): MockFunction;
    intercept(object: any, methodName: string, interceptor: Interceptor): MockFunction;
    beforeAll(fn: () => void | Promise<void>): void;
    beforeEach(fn: () => void | Promise<void>): void;
    clearAllMock(): void;
    resetAllMock(): void;
    restoreAllMock(): void;
}
