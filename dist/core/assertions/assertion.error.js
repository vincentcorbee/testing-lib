import { MatcherResult } from "./matcher-result.js";
export class AssertionError extends Error {
    matcherResult;
    constructor(matcherResultLike) {
        const matcherResult = matcherResultLike instanceof MatcherResult ? matcherResultLike : new MatcherResult(matcherResultLike);
        super(matcherResult.message);
        this.matcherResult = matcherResult;
    }
    toJSON() {
        return this.matcherResult;
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
}
//# sourceMappingURL=assertion.error.js.map