import { AssertionError } from '../core/assertions/index.js';
import { Suite, TestCase, FullResult } from '../core/types.js';
import { Reporter } from './reporter.js';

export type JUnitReporterOptions = {
  onEnd?: (report: string) => void;
};

export class JUnitReporter extends Reporter {
  constructor(private options: JUnitReporterOptions = {}) {
    super();
  }

  onEnd(result: FullResult) {
    const report = this.#createTestReport(result);

    if (this.options.onEnd) this.options.onEnd(report);
  }

  #createTestReport(result: FullResult) {
    const { total, failed, skipped, duration } = result;

    return `
    <?xml version="1.0" encoding="UTF-8"?>
    <testsuites tests="${total}" failures="${failed}" skipped="${skipped}" time="${this.#createDurationString(duration)}">
      ${this.#processSuite(result.suite)}
    </testsuites>
    `;
  }

  #processSuite(suite: Suite) {
    const { isRoot, name, error, entries } = suite;
    const tests = entries.filter((entry) => entry.type === 'test');
    const results = tests.reduce(
      (acc, test) => {
        if (test.results[0].status === 'failed') acc.failed++;
        if (test.results[0].status === 'skipped') acc.skipped++;

        acc.duration += test.results[0].duration ?? 0;

        return acc;
      },
      { failed: 0, skipped: 0, duration: 0 },
    );

    let report = '';

    if (!isRoot)
      report += `<testsuite name="${name}" tests="${tests.length}" failures="${results.failed}" skipped="${results.skipped}" time="${this.#createDurationString(results.duration)}">`;

    if (error) report += this.#handleError(error);

    const reportEntries = this.#processEntries(suite.entries);

    return `${report}${reportEntries}${isRoot ? '' : '</testsuite>'}`;
  }

  #processTest(testCase: TestCase) {
    const { name, parent, results } = testCase;
    const [{ status, duration, error }] = results;

    let report = `<testcase name="${name}" classname="${parent.name}" time="${this.#createDurationString(duration ?? 0)}"${status === 'passed' ? ' /' : ''}>`;

    switch (status) {
      case 'failed':
        report += `${this.#handleError(error)}`;
        break;
      case 'skipped':
        report += `${this.#createSkippedMessage()}`;
        break;
      default:
    }

    return `${report}${status === 'passed' ? '' : '</testcase>'}`;
  }

  #processEntries(entries: Array<Suite | TestCase>) {
    let report = '';
    let describeReport = '';
    let testReport = '';

    for (const entry of entries) {
      const { type } = entry;

      if (type === 'describe') describeReport += this.#processSuite(entry);
      if (type === 'test') testReport += this.#processTest(entry);
    }

    /* Ouput test report before nested describe blocks */
    return `${report}${testReport}${describeReport}`;
  }

  #handleError(error: any) {
    let content = '';
    let errorType = '';
    let message = '';
    let type = '';

    if (error instanceof AssertionError) {
      const { matcherResult } = error;
      const { context, expected, actual } = matcherResult;

      errorType = 'failure';
      type = 'AssertionError';

      if (context && !context.parent) context.parent = { name: 'expect', type: 'expect', value: actual, parent: null };

      switch (context?.parent?.name) {
        case 'not':
          message = `${this.#createExpectedMessage(expected, context?.parent?.name)}`;
          break;
        default:
          message = this.#createExpectedMessage(expected);
          content += this.#createReceivedMessage(actual);
      }
    } else {
      errorType = 'error';
      type = error.name;
      message = error.message;
      content = this.#formatStacktrace(error.stack);
    }

    return `<${errorType} message="${message}" type="${type}">${content}</${errorType}>`;
  }

  #createDurationString(duration: number, min = 0) {
    return duration > min ? `${(duration / 1000).toFixed(6)}`.replace(/0+$/, '') : '0';
  }

  #formatStacktrace(stack: string) {
    return stack;
    // return `${stack
    //   .split('\n')
    //   .map((line: string) => `<div><span>${line}</span></div>`)
    //   .join('')}`;
  }

  #createReceivedMessage(received: any) {
    return `Received: "${received}"`;
  }

  #createExpectedMessage(expected: any, modifier?: string) {
    return `Expected:${modifier ? ` ${modifier}` : ''} ${expected}`;
  }

  #createSkippedMessage() {
    return `<skipped/>`;
  }
}
