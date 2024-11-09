import { Suite, TestCase, TestReport, TestResult } from '../core/types.js';

type FullConfig = {};

export interface Reporter {
  onBegin(config: FullConfig, suite: Suite): void;
  onSuiteBegin(suite: Suite): void;
  onSuiteEnd(suite: Suite): void;
  onTestBegin(testCase: TestCase): void;
  onTestEnd(testCase: TestCase, testResult: TestResult): void;
  onEnd(result: TestReport): void;
  onError(error: any, suite: Suite): void;
}
