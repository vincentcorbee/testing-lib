export declare function expect(actual: any): {
    toEqual: (expected: any) => void;
    toBeDefined: () => void;
    readonly resolves: {
        toEqual: (expected: any) => Promise<void>;
    };
};
