import { TestRunner } from "./test-runner.js";
import { Runner } from "./types.js";
export declare const testRunner: TestRunner;
export declare function beforeAll(fn: any): void;
export declare function beforeEach(fn: any): void;
export declare function describe(name: string, fn: any): Promise<void>;
export declare function test(name: string, fn: any): void;
export declare const runner: Runner;
