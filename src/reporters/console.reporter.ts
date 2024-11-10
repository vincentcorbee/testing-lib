import { AssertionError } from '../core/assertions/index.js';
import { Suite, TestCase, FullResult } from '../core/types.js';
import { Reporter } from './reporter.js';

export class ConsoleReporter extends Reporter {
  onEnd(result: FullResult) {
    console.log(this.#createTestReport(result));
  }

  #createTestReport(result: FullResult) {
    const { duration, skipped, failed, passed, total } = result;

    let report = this.#processSuite(result.suite);

    report += '\n';
    report += '\x1b[1mSummary\x1b[m\n\n';
    report += total === 0 || passed > 0 ? '\x1b[1;42m PASS \x1b[m\n' : '\x1b[1;41m FAIL \x1b[m\n';
    report += '\n\x1b[1mTests\x1b[m: ';
    report += `\x1b[1;93m${skipped} skipped\x1b[m, `;
    report += `\x1b[1;32m${passed} passed\x1b[m, `;
    report += `\x1b[1;91m${failed} failed\x1b[m, `;
    report += `\x1b[2m${total} total\x1b[m\n`;
    report += `\x1b[1mDuration\x1b[m: ${this.#createDurationString(duration, -1)}\n`;

    return report;
  }

  #processSuite(suite: Suite) {
    const { isRoot, name, depth, error } = suite;

    let report = '';

    if (!isRoot) report += `${this.#createIndentation(depth - 1)}\x1b[1m${name}\x1b[m\n`;

    if (error) report += this.#handleError(error, depth, suite);

    /* Ouput test report before nested describe blocks */
    return report + this.#processEntries(suite.entries);
  }

  #processTest(testCase: TestCase) {
    const { depth, name, parent, results } = testCase;
    const [{ status, duration, error }] = results;

    switch (status) {
      case 'failed':
        return `${this.#createIndentation(depth - 1)}${this.#createTestMessage(name, this.#createDurationString(duration ?? 0), false)}\n\n${this.#handleError(error, depth, parent, testCase)}`;
      case 'skipped':
        return `${this.#createIndentation(depth - 1)}${this.#createSkippedMessage(name)}\n`;
      default:
        return `${this.#createIndentation(depth - 1)}${this.#createTestMessage(name, this.#createDurationString(duration ?? 0), true)}\n`;
    }
  }

  #processEntries(entries: Array<Suite | TestCase>) {
    let describeReport = '';
    let testReport = '';

    for (const entry of entries) {
      const { type } = entry;

      if (type === 'describe') describeReport += this.#processSuite(entry);
      if (type === 'test') testReport += this.#processTest(entry);
    }

    return testReport + describeReport;
  }

  #handleError(error: any, indent: number, suite: Suite, testCase?: TestCase) {
    let report = '';
    let errorMessage = '';
    let chain = '';

    if (error instanceof AssertionError) {
      const { matcherResult } = error;
      const { context, expected, actual } = matcherResult;

      if (context && !context.parent) context.parent = { name: 'expect', type: 'expect', value: actual, parent: null };

      chain = matcherResult.chain;

      switch (context?.parent?.name) {
        case 'not':
          errorMessage += `${this.#createIndentation(indent + 1)}${this.#createExpectedMessage(expected, context?.parent?.name)}\n`;
          break;
        default:
          errorMessage += `${this.#createIndentation(indent + 1)}${this.#createExpectedMessage(expected)}\n`;
          errorMessage += `${this.#createIndentation(indent + 1)}${this.#createReceivedMessage(actual)}\n`;
      }
    } else {
      errorMessage += `${this.#createIndentation(indent)}Error message: ${error.message}`;

      report += `${this.#formatStacktrace(error.stack, indent)}\n\n`;
    }

    const trace = this.#createTrace(suite, testCase);

    if (trace) report += `${this.#createIndentation(indent)}${trace}\n`;

    if (chain) report += `\n${this.#createIndentation(indent)}${chain}\n`;

    report += `${chain || trace ? '\n' : ''}${errorMessage}\n`;

    return report;
  }

  #createDurationString(duration: number, min = 1) {
    return duration > 10000
      ? `${(duration / 1000).toFixed(2)} s`.replace('.00', '')
      : duration > min
        ? `${duration.toFixed(2)} ms`.replace('.00', '')
        : '';
  }

  #formatStacktrace(stack: string, indent: number) {
    return `\x1b[91m${stack
      .split('\n')
      .map((line: string) => `${this.#createIndentation(indent)}${line}`)
      .join('\n')}\x1b[m`;
  }

  #createReceivedMessage(received: any) {
    return `\x1b[mReceived: \x1b[91;1m"${received}"\x1b[m`;
  }

  #createExpectedMessage(expected: any, modifier?: string) {
    return `Expected:${modifier ? ` ${modifier}` : ''} \x1b[92;1m"${expected}\x1b[m"`;
  }

  #createTestMessage(name: string, durationString: string, passed: boolean) {
    const icon = passed ? '\x1b[32;1m✓\x1b[m' : '\x1b[91;1m✕\x1b[m';

    return `${icon} \x1b[90m${name}${durationString ? ` (${durationString})` : ''}\x1b[m`;
  }

  #createIndentation(indent: number) {
    return ' '.repeat(indent);
  }

  #createSkippedMessage(name: string) {
    return `\x1b[93;1m○\x1b[m \x1b[90m\x1b[1mskipped\x1b[22m: ${name}\x1b[m`;
  }

  #createTrace(suite: Suite, testCase?: TestCase) {
    let trace: string[] = [];
    let parentSuite: Suite | null = suite;

    if (testCase) trace.push(testCase.name);

    while (parentSuite) {
      if (parentSuite.isRoot === false) trace.unshift(parentSuite.name);

      parentSuite = parentSuite.parent;
    }

    return trace.length > 0 ? `\x1b[91;1m● ${trace.join(' › ')}\x1b[m` : '';
  }
}
