import { Suite, TestCase, FullResult, TestResult } from '../core/types.js';

export interface ReporterInterface {
  onBegin(suite: Suite): void;
  onSuiteBegin(suite: Suite): void;
  onSuiteEnd(suite: Suite): void;
  onTestBegin(testCase: TestCase): void;
  onTestEnd(testCase: TestCase, testResult: TestResult): void;
  onEnd(result: FullResult): void;
  onError(error: unknown, suite: Suite): void;
}

export type Reporter = ReporterInterface;

export type Reporters = 'console' | 'html' | 'junit';
