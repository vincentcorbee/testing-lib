import { MatcherResult, MatcherResultProperties } from "./matcher-result.js"

export class AssertionError extends Error {
  matcherResult: MatcherResult

  constructor(matcherResultLike: MatcherResult | MatcherResultProperties) {
    const matcherResult = matcherResultLike instanceof MatcherResult ? matcherResultLike : new MatcherResult(matcherResultLike)

    super(matcherResult.message)

    this.matcherResult = matcherResult
  }

  toJSON() {
    return this.matcherResult
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}