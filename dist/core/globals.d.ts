import { TestRunner } from "./test-runner.js";
import { MockFunction, MockFunctionImplementation } from "./types.js";
export declare const testRunner: TestRunner;
export declare function beforeAll(fn: any): void;
export declare function beforeEach(fn: any): void;
export declare function describe(name: string, fn: any): Promise<void>;
export declare function test(name: string, fn: any): void;
type Runner = {
    readonly mockFunction: (mockImplementation?: MockFunctionImplementation) => MockFunction;
};
export declare const runner: Runner;
export {};
