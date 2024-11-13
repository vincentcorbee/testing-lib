import { Suite, FullResult } from './types.js';

export class TestRun {
  skipped: number;
  passed: number;
  failed: number;
  suite: Suite;

  #started: boolean;
  #timestampStart: number;
  #timestampEnd: number;
  #duration: number;

  constructor(suite: Suite) {
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.suite = suite;
    this.#started = false;
    this.#timestampStart = 0;
    this.#timestampEnd = 0;
    this.#duration = 0;
  }

  get total() {
    return this.passed + this.failed + this.skipped;
  }

  get started() {
    return this.#started;
  }

  get duration() {
    return this.#duration;
  }

  get result(): FullResult {
    return {
      status: this.failed === 0 && (this.total === 0 || this.passed > 0) ? 'passed' : 'failed',
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
      total: this.total,
      duration: this.duration,
      suite: this.suite,
    };
  }

  start() {
    if (this.#started) return;

    this.#timestampStart = performance.now();
    this.#started = true;
  }

  stop() {
    if (!this.#started) return;

    this.#timestampEnd = performance.now();
    this.#duration = this.#timestampEnd - this.#timestampStart;
  }
}
