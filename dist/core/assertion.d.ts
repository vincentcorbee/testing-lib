export declare class MatcherResult {
    name: any;
    actual: any;
    expected: any;
    message: string;
    pass: boolean;
    constructor(properties?: {});
}
export declare class AssertionError extends Error {
    matcherResult: MatcherResult;
    constructor(matcherResultLike: any);
    toJSON(): MatcherResult;
    toString(): string;
}
export declare function expect(actual: any): {
    toEqual: (expected: any) => void;
    toBeDefined: () => void;
    readonly resolves: {
        toEqual: (expected: any) => Promise<void>;
    };
};
