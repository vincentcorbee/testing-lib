export class TestRun {
  skipped: number
  passed: number
  failed: number

  #started: boolean
  #report: string
  #timestampStart: number

  constructor() {
    this.passed = 0
    this.failed = 0
    this.skipped = 0
    this.#report = ''
    this.#started = false
    this.#timestampStart = 0
  }

  static createDurationString(duration: number) {
    return duration > 10000 ? ` (${(duration / 1000).toFixed(2)} s)`.replace('.00', '') : duration > 1 ?  ` (${duration.toFixed(2)} ms)`.replace('.00', '') : ''
  }

  get total() {
    return this.passed + this.failed + this.skipped
  }

  get report() {
    return this.#report
  }

  get started() {
    return this.#started
  }

  start() {
    if(this.#started) return

    this.#timestampStart = performance.now()
    this.#started = true
  }

  stop() {
    if(!this.#started) return

    this.#report += '\n'
    this.#report += '\x1b[1mSummary\x1b[m\n\n'
    this.#report += this.failed === 0 ? '\x1b[1;42m PASS \x1b[m\n' : '\x1b[1;41m FAIL \x1b[m\n'
    this.#report += '\n\x1b[1mTests\x1b[m: '
    this.#report += `\x1b[1;93m${this.skipped} skipped\x1b[m, `
    this.#report += `\x1b[1;32m${this.passed} passed\x1b[m, `
    this.#report += `\x1b[1;91m${this.failed} failed\x1b[m, `
    this.#report += `\x1b[2m${this.total} total\x1b[m\n`
    this.#report += `\x1b[1mDuration\x1b[m: ${TestRun.createDurationString(performance.now() - this.#timestampStart)}\n`
  }

  addToReport(value: string) {
    this.#report +=value
  }
}