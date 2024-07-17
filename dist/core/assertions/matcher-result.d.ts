export type MatcherResultProperties = {
    name?: string | undefined;
    actual?: any;
    expected?: any;
    message?: string | undefined;
    pass?: boolean | undefined;
};
export declare class MatcherResult {
    name: any;
    actual: any;
    expected: any;
    message: string;
    pass: boolean;
    constructor(properties?: MatcherResultProperties);
}
