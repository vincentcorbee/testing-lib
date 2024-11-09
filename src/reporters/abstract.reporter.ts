import { Suite, TestCase, TestResult, TestReport } from '../core/types.js';
import { Reporter } from './reporter.type.js';

export abstract class AbstractReporter implements Reporter {
  onBegin(_suite: Suite) {}

  onSuiteBegin(_suite: Suite) {}

  onSuiteEnd(_suite: Suite) {}

  onError(_error: any, _suite: Suite) {}

  onTestBegin(_testCase: TestCase) {}

  onTestEnd(_testCase: TestCase, _result: TestResult) {}

  onEnd(_result: TestReport) {}
}
