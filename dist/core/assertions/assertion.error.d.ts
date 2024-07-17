import { MatcherResult, MatcherResultProperties } from "./matcher-result.js";
export declare class AssertionError extends Error {
    matcherResult: MatcherResult;
    constructor(matcherResultLike: MatcherResult | MatcherResultProperties);
    toJSON(): MatcherResult;
    toString(): string;
}
