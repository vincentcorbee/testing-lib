export declare class TestRun {
    #private;
    skipped: number;
    passed: number;
    failed: number;
    constructor();
    static createDurationString(duration: number, min?: number): string;
    get total(): number;
    get report(): string;
    get started(): boolean;
    start(): void;
    stop(): void;
    addToReport(value: string): void;
}
