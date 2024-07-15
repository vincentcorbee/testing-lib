export type Intercept = {
  (...args: any[]): any
  restore: () => void
}

export type MockFunctionMock = {
  calls: any[][],
  contexts: any[],
  results: any[]
}

export type MockFunction = {
  (...args: any[]): any
  restore: () => void,
  reset: () => void,
  clear: () => void,
  mock: MockFunctionMock
}

export type MockFunctionImplementation = GenericFunction

export type Test = {
  name: string
  fn: () => void | Promise<any>
  skip?: boolean
}

export type GenericFunction = (...args: any) => any

export type Interceptor = (original: GenericFunction, ...args: any[]) => any

export type DescribeBlock = {
  name: string
  blocks: Map<string, DescribeBlock>
  tests: Test[]
  isRoot: boolean
}

export type Runner = {
  readonly mockFunction: (mockImplementation?: MockFunctionImplementation) => MockFunction
  clearAllMock(): void
  resetAllMock(): void
  restoreAllMock(): void
}