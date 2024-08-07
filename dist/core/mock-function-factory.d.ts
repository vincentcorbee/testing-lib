import { GenericFunction, MockFunction } from './types.js';
export declare function noop(): void;
export declare function MockFunctionFactory(mockImplementation?: GenericFunction, intercept?: {
    object: any;
    methodName: string;
}): MockFunction;
