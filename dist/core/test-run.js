export class TestRun {
    skipped;
    passed;
    failed;
    #summary;
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
        this.#summary = '';
    }
    get total() {
        return this.passed + this.failed + this.skipped;
    }
    get summary() {
        let result = this.#summary;
        result += '\n';
        result += this.failed === 0 ? '\x1b[1;42m PASS \x1b[m\n' : '\x1b[1;41m FAIL \x1b[m\n';
        result += '\n\x1b[1mTests\x1b[m: ';
        result += `\x1b[1;93m${this.skipped} skipped\x1b[m, `;
        result += `\x1b[1;32m${this.passed} passed\x1b[m, `;
        result += `\x1b[1;91m${this.failed} failed\x1b[m, `;
        result += `\x1b[2m${this.total} total\x1b[m\n`;
        return result;
    }
    addToSummary(value) {
        this.#summary += value;
    }
}
//# sourceMappingURL=test-run.js.map