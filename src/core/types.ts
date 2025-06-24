import { ReporterInterface, Reporters } from '../reporters/types.js';

export interface Faker {
  person: {
    firstName: () => string;
    lastName: () => string;
    sex: () => string;
  };
  internet: {
    email: () => string;
  };
  date: {
    past: (years: number) => Date;
    birthdate: (options?: { min?: number; max?: number; mode?: 'age' | 'year' }) => Date;
  };
  location: {
    street: () => string;
    city: () => string;
    secondaryAddress: () => string;
    zipCode: () => string;
    buildingNumber: () => string;
  };
  string: {
    numeric: (length: number) => string;
  };
  company: {
    name: () => string;
  };
}

declare global {
  var faker: Faker;
  interface GlobalThis {
    faker: Faker;
    runner: Runner;
  }
}

export type Intercept = {
  (...args: any[]): any;
  restore: () => void;
};

export type MockFunctionMock = {
  calls: any[][];
  contexts: any[];
  results: any[];
};

export type MockFunction = {
  (...args: any[]): any;
  restore: () => void;
  reset: () => void;
  clear: () => void;
  mock: MockFunctionMock;
};

export type MockFunctionImplementation = GenericFunction;

export type Callback = () => void | Promise<void>;

export type TestBlock = {
  type: 'test';
  name: string;
  fn: TestCallback;
  skip?: boolean;
  only?: boolean;
  testCase: TestCase;
};

export type TestCallback = Callback;
export type DescribeCallback = Callback;
export type BeforeEachCallback = Callback;
export type BeforeAllCallback = Callback;
export type AfterAllCallback = Callback;
export type AfterEachCallback = Callback;

export type GenericFunction = (...args: any) => any;

export type Interceptor = (original: GenericFunction, ...args: any[]) => any;

export type DescribeBlock = {
  type: 'describe' | 'root';
  name: string;
  blocks: Array<DescribeBlock | TestBlock>;
  isRoot: boolean;
  parent: DescribeBlock | null;
  skip: boolean;
  only: boolean;
  beforeAllCallbacks: BeforeAllCallback[];
  beforeEachCallbacks: BeforeEachCallback[];
  afterAllCallbacks: AfterAllCallback[];
  afterEachCallbacks: AfterEachCallback[];
  suite: Suite;
};

export type TestRunnerEvent =
  | 'completed'
  | 'started'
  | 'test:begin'
  | 'test:end'
  | 'suite:begin'
  | 'suite:end'
  | 'end'
  | 'begin'
  | 'error';

export type TestResultStatus = 'passed' | 'failed' | 'skipped';

export type TestResult = {
  status?: TestResultStatus;
  error?: any;
  duration?: number;
  start?: number;
  end?: number;
};

export type Suite = {
  type: 'describe' | 'root';
  name: string;
  entries: Array<Suite | TestCase>;
  parent: Suite | null;
  isRoot: boolean;
  depth: number;
  error?: any;
};

export type TestCase = {
  type: 'test';
  name: string;
  parent: Suite;
  depth: number;
  results: TestResult[];
};

export type FullResult = {
  status: TestResultStatus;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
  suite: Suite;
};

export type Runner = {
  readonly mockFunction: (mockImplementation?: MockFunctionImplementation) => MockFunction;
  intercept(object: any, methodName: string, interceptor: Interceptor): MockFunction;
  spyOn(object: any, methodName: string): MockFunction;
  clearAllMock(): void;
  resetAllMock(): void;
  restoreAllMock(): void;
  abort(): void;
  onEnd(fn: (result: string) => void): void;
  onBegin(fn: () => void): void;
  off(event: 'begin' | 'end', fn: (result?: string) => void): void;
  removeAllListeners(): void;
  defineConfig(config: TestConfig): void;
};

export type MatcherResultInterface = {
  name?: string;
  actual?: any;
  expected?: any;
  message?: string;
  pass?: boolean;
  context?: ExpectContext;
  modifier?: 'not' | 'resolves';
};

export type Matchers = {
  readonly toEqual: (expected: any) => void;
  readonly toBeDefined: () => void;
  readonly toBeVisible: () => void;
  readonly resolves: {
    readonly toEqual: (expected: any) => Promise<void>;
  };
  readonly rejects: {
    readonly toThrow: (expected: any) => Promise<void>;
  };
  readonly not: {
    readonly toEqual: (expected: any) => void;
    readonly toBeDefined: () => void;
    readonly toBeVisible: () => void;
  };
};

export type Expect = {
  (actual: any): Matchers;
};

export type ExpectContext = {
  name: string;
  type: 'matcher' | 'modifier' | 'expect';
  value?: any;
  parent: ExpectContext | null;
};

export type ReporterConfig = { name: Reporters; options?: any };

export type TestConfigReporter = ReporterInterface | Reporters | ReporterConfig;

export type TestConfig = {
  reporters?: TestConfigReporter[];
};

export type TestFunction = {
  (name: string, fn: TestCallback): void;
  skip(name: string, fn: TestCallback): void;
  only(name: string, fn: TestCallback): void;
};
