export class MatcherResult {
    name;
    actual;
    expected;
    message;
    pass;
    constructor(properties = {}) {
        const { name, actual, expected, message = 'Unknown', pass = true } = properties;
        this.name = name;
        this.actual = actual;
        this.expected = expected;
        this.message = message;
        this.pass = pass;
    }
}
//# sourceMappingURL=matcher-result.js.map