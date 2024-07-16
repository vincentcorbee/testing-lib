import { AssertionError } from '../core/assertion.js';
import { performAction } from '../shared/perform-action.js';
export function getBySelector(selector) {
    return performAction((resolve) => {
        const element = document.querySelector(selector);
        if (!element)
            throw new AssertionError({ name: 'getBySelector', expected: `Element with ${selector}`, actual: element, pass: false, message: `${selector} not found` });
        resolve(element);
    });
}
export function getByText(text, options = { parent: '*' }) {
    const parent = typeof options === 'string' ? options : options.parent || '*';
    return performAction(resolve => {
        const result = document.evaluate(`//${parent}[contains(text(),'${text}')]`, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        const element = result.iterateNext();
        if (!element)
            throw new AssertionError({ name: 'getByText', expected: `Element with ${text}`, actual: element, pass: false, message: `${text} not found` });
        resolve(element);
    });
}
//# sourceMappingURL=screen.js.map