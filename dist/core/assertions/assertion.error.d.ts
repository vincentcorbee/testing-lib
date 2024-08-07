import { MatcherResultInterface } from '../types.js';
import { MatcherResult } from './matcher-result.js';
export declare class AssertionError extends Error {
    matcherResult: MatcherResult;
    constructor(matcherResultLike: MatcherResult | MatcherResultInterface);
    toJSON(): MatcherResult;
    toString(): string;
}
