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
  type: 'describe';
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
};

export type Runner = {
  readonly mockFunction: (mockImplementation?: MockFunctionImplementation) => MockFunction;
  intercept(object: any, methodName: string, interceptor: Interceptor): MockFunction;
  clearAllMock(): void;
  resetAllMock(): void;
  restoreAllMock(): void;
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
  readonly toBeDefined: (expected: any) => void;
  readonly toBeVisible: () => void;
  readonly resolves: {
    readonly toEqual: (expected: any) => void;
  };
  readonly rejects: {
    readonly toThrow: (expected: any) => void;
  };
  readonly not: {
    readonly toEqual: (expected: any) => void;
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
