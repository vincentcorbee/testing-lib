export type MatcherResultProperties = {
  name?: string | undefined;
  actual?: any;
  expected?: any;
  message?: string | undefined;
  pass?: boolean | undefined;
}

export class MatcherResult {
  name: any
  actual: any
  expected: any
  message: string
  pass: boolean

  constructor(properties: MatcherResultProperties = {}) {
    const { name, actual, expected, message = 'Unknown', pass = true } = properties

    this.name = name
    this.actual = actual
    this.expected = expected
    this.message = message
    this.pass = pass
  }
}