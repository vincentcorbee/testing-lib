import { Suite, TestCase, TestResult, FullResult } from '../core/types.js';
import { ReporterInterface } from './types.js';

export abstract class Reporter implements ReporterInterface {
  onBegin(_suite: Suite) {}
  onSuiteBegin(_suite: Suite) {}
  onSuiteEnd(_suite: Suite) {}
  onError(_error: any, _suite: Suite) {}
  onTestBegin(_testCase: TestCase) {}
  onTestEnd(_testCase: TestCase, _result: TestResult) {}
  onEnd(_result: FullResult) {}
}
