import { AssertionError } from '../core/assertions/index.js';
import { performAction } from '../shared/perform-action.js';
export function getBySelector(selector) {
    return performAction((resolve) => {
        const element = document.querySelector(selector);
        if (!element)
            throw new AssertionError({ name: 'getBySelector', expected: `Element with ${selector}`, actual: element, pass: false, message: `${selector} not found` });
        resolve(element);
    });
}
export function getByText(text, options = { parent: '*', index: 0 }) {
    const { parent = '*', index = 0 } = typeof options === 'string' ? { parent: options } : options || {};
    return performAction(resolve => {
        const result = document.evaluate(`//${parent}[contains(text(),'${text}')]`, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        let element;
        let i = 0;
        while ((element = result.iterateNext())) {
            if (i === index)
                break;
            i++;
        }
        if (!element)
            throw new AssertionError({ name: 'getByText', expected: `Element with ${text}`, actual: element, pass: false, message: `${text} not found` });
        resolve(element);
    });
}
//# sourceMappingURL=screen.js.map