import { ExpectContext, MatcherResultInterface } from '../types.js';

export class MatcherResult {
  name: any;
  actual: any;
  expected: any;
  message: string;
  pass: boolean;
  modifier?: 'not' | 'resolves';
  context?: ExpectContext;

  constructor(properties: MatcherResultInterface = {}) {
    const { name, actual, expected, message = 'Unknown', pass = true, context, modifier } = properties;

    this.name = name;
    this.actual = actual;
    this.expected = expected;
    this.message = message;
    this.pass = pass;
    this.context = context;
    this.modifier = modifier;
  }

  get chain() {
    let chain = '';

    let currentContext: ExpectContext | null = this.context ?? null;

    while (currentContext) {
      const { name, type, parent } = currentContext;

      chain = `${parent !== null ? '.' : ''}${type === 'expect' ? `\x1b[90m${name}\x1b[m` : name}${type === 'matcher' ? '(\x1b[32mexpected\x1b[m)' : type === 'expect' ? `(\x1b[31mrecieved\x1b[m)` : ''}${chain}`;

      currentContext = parent;
    }

    return chain;
  }
}
