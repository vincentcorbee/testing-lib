import { ExpectContext, MatcherResultInterface } from '../types.js';
export declare class MatcherResult {
    name: any;
    actual: any;
    expected: any;
    message: string;
    pass: boolean;
    modifier?: 'not' | 'resolves';
    context?: ExpectContext;
    constructor(properties?: MatcherResultInterface);
    get chain(): string;
}
