export class MatcherResult {
    name;
    actual;
    expected;
    message;
    pass;
    modifier;
    context;
    constructor(properties = {}) {
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
        let currentContext = this.context ?? null;
        while (currentContext) {
            const { name, type, parent } = currentContext;
            chain = `${parent !== null ? '.' : ''}${type === 'expect' ? `\x1b[90m${name}\x1b[m` : name}${type === 'matcher' ? '(\x1b[32mexpected\x1b[m)' : type === 'expect' ? `(\x1b[31mrecieved\x1b[m)` : ''}${chain}`;
            currentContext = parent;
        }
        return chain;
    }
}
//# sourceMappingURL=matcher-result.js.map