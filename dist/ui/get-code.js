const CharCodes = {
    A: 65,
    z: 122,
};
const keyCodes = {
    ' ': 'Space',
    '0': 'Digit0',
    ')': 'Digit0',
    '1': 'Digit1',
    '!': 'Digit1',
    '2': 'Digit2',
    '@': 'Digit2',
    '3': 'Digit3',
    '#': 'Digit3',
    '4': 'Digit4',
    $: 'Digit4',
    '5': 'Digit5',
    '%': 'Digit5',
    '6': 'Digit6',
    '^': 'Digit6',
    '7': 'Digit7',
    '&': 'Digit7',
    '8': 'Digit8',
    '*': 'Digit8',
    '9': 'Digit9',
    '(': 'Digit9',
    '§': 'IntlBackslash',
    '±': 'IntlBackslash',
    '`': 'Backquote',
    '~': 'Backquote',
    '[': 'BracketLeft',
    '{': 'BracketLeft',
    ']': 'BracketRight',
    '}': 'BracketRight',
    ',': 'Comma',
    '<': 'Comma',
    '.': 'Period',
    '>': 'Period',
    '/': 'Slash',
    '?': 'Slash',
    '\\': 'Backslash',
    '|': 'Backslash',
    ';': 'Semicolon',
    ':': 'Semicolon',
    "'": 'Quote',
    '"': 'Quote',
    '=': 'Equal',
    '+': 'Equal',
    '-': 'Minus',
    _: 'Minus',
};
export function getCode(key) {
    switch (key) {
        case ' ':
            return 'Space';
        case '0':
        case ')':
            return `Digit0`;
        case '1':
        case '!':
            return `Digit1`;
        case '2':
        case '@':
            return `Digit2`;
        case '3':
        case '#':
            return `Digit3`;
        case '4':
        case '$':
            return `Digit4`;
        case '5':
        case '%':
            return `Digit5`;
        case '6':
        case '^':
            return `Digit6`;
        case '7':
        case '&':
            return `Digit7`;
        case '8':
        case '*':
            return `Digit8`;
        case '9':
        case '(':
            return `Digit9`;
        case '§':
        case '±':
            return 'IntlBackslash';
        case '`':
        case '~':
            return 'Backquote';
        case '[':
        case '{':
            return 'BracketLeft';
        case ']':
        case '}':
            return 'BracketRight';
        case ',':
        case '<':
            return 'Comma';
        case '.':
        case '>':
            return 'Period';
        case '/':
        case '?':
            return 'Slash';
        case '\\':
        case '|':
            return 'Backslash';
        case ';':
        case ':':
            return 'Semicolon';
        case "'":
        case '"':
            return 'Quote';
        case '=':
        case '+':
            return 'Equal';
        case '-':
        case '_':
            return 'Minus';
        case ' ':
            return 'Space';
        default: {
            const codePoint = key.codePointAt(0);
            if (codePoint >= CharCodes.A && codePoint <= CharCodes.z)
                return `Key${key.toUpperCase()}`;
            return key;
        }
    }
}
//# sourceMappingURL=get-code.js.map