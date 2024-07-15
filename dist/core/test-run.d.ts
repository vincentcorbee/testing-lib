export declare class TestRun {
    #private;
    skipped: number;
    passed: number;
    failed: number;
    constructor();
    get total(): number;
    get summary(): string;
    addToSummary(value: string): void;
}
