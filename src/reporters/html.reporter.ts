import { AssertionError } from '../core/assertions/index.js';
import { Suite, TestCase, FullResult, MatcherResultInterface, ExpectContext } from '../core/types.js';
import { Reporter } from './reporter.js';

export type HTMLReporterOptions = {
  onEnd?: (report: string) => void;
};

export class HTMLReporter extends Reporter {
  constructor(private options: HTMLReporterOptions = {}) {
    super();
  }

  onEnd(result: FullResult) {
    const report = this.#createTestReport(result);

    if (this.options.onEnd) this.options.onEnd(report);
  }

  #style() {
    return `
    <style>
      .report {
        --report-font-size: 14px;
        --report-color: var(--color-on-surface);
        --report-passed-color: var(--color-green);
        --report-failed-color: var(--color-error);
        --report-background-color: var(--color-surface);
        --report-container-padding: 16px;
        --report-block-padding-left: 8px;
        --report-test-items-padding-between: 8px;
        --report-suite-title-weight: bold;
        --report-font-family: Roboto, sans-serif;

        --report-test-passed-icon-color: var(--color-green);
        --report-test-failed-icon-color: var(--color-error);
        --report-test-skipped-icon-color: 53, 91%, 47%;
        --report-test-icon-size: 14px;
        --report-test-error-stack-trace-color: var(--color-error);
        --report-test-error-trace-color: var(--color-error);

        --report-test-title-color: var(--color-gray);
        --report-test-duration-color: var(--color-gray);

        --report-header-title-size: 24px;
        --report-header-title-weight: bold;

        --report-summary-title-weight: bold;
        --report-summary-result-weight: bold;
        --report-summary-result-color: var(--color-surface);
        --report-summary-result-background-color: var(--color-green);
        --report-summary-result-padding: 5px;

        --report-summary-skipped-color: 53, 91%, 47%;
        --report-summary-skipped-weight: bold;

        --report-summary-passed-color: var(--color-green);
        --report-summary-passed-weight: bold;

        --report-summary-failed-color: var(--color-error);
        --report-summary-failed-weight: bold;

        --report-summary-total-color: hsl(var(--color-gray));
        --report-summary-total-weight: normal;

        --report-summary-result-label-weight: bold;
        --report-summary-padding-top: 16px;


        padding: var(--report-container-padding);
        font-family: var(--report-font-family);
        color: hsl(var(--report-color));
        font-size: var(--report-font-size);
        background-color: hsl(var(--report-background-color));
      }

      .color--red {
        color: hsl(var(--color-error))
      }

      .color--green {
        color: hsl(var(--color-green))
      }

      .report[data-theme="dark"] {
        --color-on-surface: 240, 14%, 90%;
        --color-surface: 223, 17%, 8%;
        --color-error: 6, 100%, 75%;
        --color-on-error: 357, 100%, 21%;
        --color-gray: 0, 0%, 58%;
        --color-green: 96, 85%, 43%;
      }

      .report[data-theme="light"] {
        --color-on-surface: 220, 10%, 11%;
        --color-surface: 240, 100%, 99%;
        --color-error: 0, 80%, 45%;
        --color-on-error: 0, 0%, 100%;
        --color-gray: 0, 0%, 38%;
        --color-green: 96, 85%, 43%;
      }

      .report__header {
        margin-bottom: 16px;
        display: flex;
        align-items: center;
      }

      .report__header > .icon-button-outline {
        margin-left: auto;
      }

      .report[data-theme="light"] .report__header > .icon-button-outline .icon-light {
        display: none;
      }

      .report[data-theme="dark"] .report__header > .icon-button-outline .icon-dark {
        display: none;
      }

      .report__header-title {
        font-size: var(--report-header-title-size);
        font-weight: var(--report-header-title-weight);
      }

      .suite,
      .test {
        padding-left: var(--report-block-padding-left);
      }

      .suite > .title {
        font-weight: var(--report-suite-title-weight);
      }

      .test > div {
        display: flex;
        align-items: center;
      }

      .test > div {
        display: flex;
        align-items: center;
      }

      .test .test__title {
        color: hsl(var(--report-test-title-color));
      }

      .test .test__duration {
        color: hsl(var(--report-test-duration-color));
      }

      .test svg {
        width: var(--report-test-icon-size);
        height: var(--report-test-icon-size);
      }

      .test .test__error {
        display: block;
        margin-top: 16px;
      }

      .test .test__error-trace {
        font-weight: bold;
        display: flex;
        align-items: center;
        color: hsl(var(--report-test-error-trace-color));
      }

      .test .test__error-trace > span:first-child {
        padding-right: 8px;
      }

      .test .test__error > div {
        margin-bottom: 16px;
      }

      .test__error-stack-trace {
        color: hsl(var(--report-test-error-stack-trace-color));
      }

      .test__error-stack-trace > div:not(:first-child) {
        padding-left: 16px;
      }

      .test[data-status="passed"] .icon {
        fill: hsl(var(--report-test-passed-icon-color));
      }

      .test[data-status="failed"] .icon {
        fill: hsl(var(--report-test-failed-icon-color));
      }

      .test[data-status="skipped"] .icon {
        fill: hsl(var(--report-test-skipped-icon-color));
      }

      .test > div:first-child span:not(:last-child) {
        padding-right: var(--report-test-items-padding-between);
      }

      .test .expected > span:not(:last-child) {
        padding-right: 4px;
      }

      .test .expected .expected__value {
        color: hsl(var(--color-green));
      }

      .suites > .suite, .suites > .test {
        padding-left: 0;
      }

      .summary {
        padding-top: var(--report-summary-padding-top);
      }

      .summary .summary__title {
        font-weight: var(--report-suite-title-weight);
        margin-bottom: 16px;
      }

      .summary .summary__result {
        font-weight: var(--report-summary-title-weight);
        margin-bottom: 16px;
      }

      .report[data-status="passed"] .summary .summary__result span {
        background-color: hsl(var(--report-passed-color));
      }

      .report[data-status="failed"] .summary .summary__result span {
        background-color: hsl(var(--report-failed-color));
      }

      .summary .summary__result span {
        display: inline-block;
        color: hsl(var(--report-summary-result-color));
        padding: var(--report-summary-result-padding);
        line-height: 1;
        border-radius: 3px;
      }

      .summary .summary__details > div span:not(:first-child) {
        padding-left: 8px;
      }

      .summary .summary__details > div:not(:last-child) {
        margin-bottom: 8px;
      }

      .summary__result-label {
        font-weight: var(--report-summary-result-label-weight);
        display: inline-block;
        min-width: 75px;
      }

      .summary .summary__skipped {
        color: hsl(var(--report-summary-skipped-color));
        font-weight: var(--report-summary-skipped-weight);
      }

      .summary .summary__passed {
        color: hsl(var(--report-summary-passed-color));
        font-weight: var(--report-summary-passed-weight);
      }

      .summary .summary__failed {
        color: hsl(var(--report-summary-failed-color));
        font-weight: var(--report-summary-failed-weight);
      }

      .summary .summary__total {
        color: hsl(var(--report-summary-total-color));
        font-weight: var(--report-summary-total-weight);
      }

      .icon-button-outline {
        --icon-button-outline-width: 40px;
        --icon-button-outline-height: 40px;
        --icon-button-outline-icon-color: hsl(var(--color-on-surface));
        --icon-button-outline-outline-width: 1px;
        --icon-button-outline-outline-color: hsl(var(--color-on-surface));
        --icon-button-shape: 9999px;

        background: none;
        border: none;
        margin: 0;
        fill: hsl(var(--icon-button-outline-icon-color));
        cursor:pointer;
        width: var(--icon-button-outline-width);
        height: var(--icon-button-outline-height);
        border: var(--icon-button-outline-outline-width) solid hsl(var(--color-on-surface));
        border-radius: var(--icon-button-shape);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon-button-outline svg {
        fill: hsl(var(--color-on-surface));
      }
    </style>`;
  }

  #summary(result: FullResult) {
    const { duration, skipped, failed, passed, total, status } = result;

    return `
    <div class="summary">
      <div class="summary__title">
        <span>Summary</span>
      </div>
      <div class="summary__result">
        ${status === 'passed' ? '<span>PASS</span>' : '<span>FAIL</span>'}
      </div>
      <div class="summary__details">
        <div>
          <span class="summary__result-label">Tests:</span>
          <span class="summary__skipped">${skipped} skipped</span>
          <span class="summary__passed">${passed} passed</span>
          <span class="summary__failed">${failed} failed</span>
          <span class="summary__total">${total} total</span>
        </div>
        <div>
          <span class="summary__result-label">Duration:</span><span class="summary__duration">${this.#createDurationString(duration, -1)}</span>
        </div>
      </div>
    </div>`;
  }

  #script() {
    return `
    <script>
      const themeButton = document.querySelector('.icon-button-outline');

      themeButton.addEventListener('click', () => {
        const report = document.querySelector('.report');
        const theme = report.getAttribute('data-theme');

        report.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
      });
    </script>`;
  }

  #createTestReport(result: FullResult) {
    const { status } = result;

    return `
    <!DOCTYPE html>
    <html doctype="html">
      <head>
        <title>Test Results</title>
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet" />
        ${this.#style()}
      </head>
      <body>
        <div class="report" data-theme="light" data-status="${status}">
          <div class="report__header">
            <span class="report__header-title">Results</span>
            <button class="icon-button-outline">
              <svg class="icon-dark" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/></svg>
              <svg class="icon-light" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/></svg>
            </button>
          </div>
          <div class="suites">${this.#processSuite(result.suite)}</div>
          ${this.#summary(result)}
          ${this.#script()}
        </div>
      </body>
    </html>
    `;
  }

  #processSuite(suite: Suite) {
    const { isRoot, name, error } = suite;

    let report = '';

    if (!isRoot) report += `<div class="suite"><div class="title"><span>${name}</span></div>`;

    if (error) report += this.#handleError(error, suite);

    const reportEntries = this.#processEntries(suite.entries);

    return `${report}${reportEntries}${isRoot ? '' : '</div>'}`;
  }

  #processTest(testCase: TestCase) {
    const { name, parent, results } = testCase;
    const [{ status, duration, error }] = results;

    let report = `<div class="test" data-status="${status}">`;

    switch (status) {
      case 'failed':
        report += `${this.#createTestMessage(name, this.#createDurationString(duration ?? 0), false)}${this.#handleError(error, parent, testCase)}`;
        break;
      case 'skipped':
        report += `${this.#createSkippedMessage(name)}`;
        break;
      default:
        report += `${this.#createTestMessage(name, this.#createDurationString(duration ?? 0), true)}`;
    }

    return `${report}</div>`;
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

  #getChain(matcherResult: MatcherResultInterface) {
    let chain = '';

    let currentContext: ExpectContext | null = matcherResult.context ?? null;

    while (currentContext) {
      const { name, type, parent } = currentContext;

      chain = `${parent !== null ? '<span>.</span>' : ''}${type === 'expect' ? `<span >${name}</span>` : name}${type === 'matcher' ? '<span>(<span class="color--green">expected</span>)</span>' : type === 'expect' ? `<span>(<span class="color--red">recieved</span>)</span>` : ''}${chain}`;

      currentContext = parent;
    }

    if (chain.length) return `<div class="chain">${chain}</div>`;

    return chain;
  }

  #handleError(error: any, suite: Suite, testCase?: TestCase) {
    let report = '<div class="test__error">';
    let errorMessage = '';
    let chain = '';

    if (error instanceof AssertionError) {
      const { matcherResult } = error;
      const { context, expected, actual } = matcherResult;

      if (context && !context.parent) context.parent = { name: 'expect', type: 'expect', value: actual, parent: null };

      chain = this.#getChain(matcherResult);

      switch (context?.parent?.name) {
        case 'not':
          errorMessage += `<div>${this.#createExpectedMessage(expected, context?.parent?.name)}</div>`;
          break;
        default:
          errorMessage += `<div>${this.#createExpectedMessage(expected)}</div>`;
          errorMessage += `<div>${this.#createReceivedMessage(actual)}</div>`;
      }
    } else {
      errorMessage += `<div><span>Error message: ${error.message}</span></div>`;

      report += `${this.#formatStacktrace(error.stack)}`;
    }

    const trace = this.#createTrace(suite, testCase);

    if (trace) report += `${trace}`;

    if (chain) report += `${chain}`;

    report += errorMessage;

    return `${report}</div>`;
  }

  #createDurationString(duration: number, min = 1) {
    return duration > 10000
      ? `${(duration / 1000).toFixed(2)} s`.replace('.00', '')
      : duration > min
        ? `${duration.toFixed(2)} ms`.replace('.00', '')
        : '';
  }

  #formatStacktrace(stack: string) {
    return `<div class="test__error-stack-trace">${stack
      .split('\n')
      .map((line: string) => `<div><span>${line}</span></div>`)
      .join('')}</div>`;
  }

  #createReceivedMessage(received: any) {
    return `<div class="expected"><span>Received:</span><span class="recieved__value">${received}"</span></div>`;
  }

  #createExpectedMessage(expected: any, modifier?: string) {
    return `<div class="expected"><span>Expected:</span>${modifier ? `<span class="modifier">${modifier}</span>` : ''}<span class="expected__value">${expected}</span></div>`;
  }

  #createTestMessage(name: string, durationString: string, passed: boolean) {
    const icon = `<span class="icon">${passed ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-208 122-468l90-90 170 170 366-366 90 90-456 456Z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m256-168-88-88 224-224-224-224 88-88 224 224 224-224 88 88-224 224 224 224-88 88-224-224-224 224Z"/></svg>'}</span>`;

    return `<div>${icon}<span class="test__title">${name}</span>${durationString ? `<span class="test__duration">(${durationString})</span>` : ''}</div>`;
  }

  #createSkippedMessage(name: string) {
    return `<div><span class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-46q-91 0-169.99-34.08-78.98-34.09-137.41-92.52-58.43-58.43-92.52-137.41Q46-389 46-480q0-91 34.08-169.99 34.09-78.98 92.52-137.41 58.43-58.43 137.41-92.52Q389-914 480-914q91 0 169.99 34.08 78.98 34.09 137.41 92.52 58.43 58.43 92.52 137.41Q914-571 914-480q0 91-34.08 169.99-34.09 78.98-92.52 137.41-58.43 58.43-137.41 92.52Q571-46 480-46Zm0-126q130 0 219-89t89-219q0-130-89-219t-219-89q-130 0-219 89t-89 219q0 130 89 219t219 89Zm0-308Z"/></svg></span><span class="test__title">Skipped: ${name}</span></div>`;
  }

  #createTrace(suite: Suite, testCase?: TestCase) {
    let trace: string[] = [];
    let parentSuite: Suite | null = suite;

    if (testCase) trace.push(testCase.name);

    while (parentSuite) {
      if (parentSuite.isRoot === false) trace.unshift(`<span>${parentSuite.name}</span>`);

      parentSuite = parentSuite.parent;
    }

    return trace.length > 0
      ? `<div class="test__error-trace"><span>●</span>${trace.join('<span class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>')}</div>`
      : '';
  }
}
