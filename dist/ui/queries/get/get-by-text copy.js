import { AssertionError } from '../../../core/assertions/index.js';
import { waitFor } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';
export function getByText(text, options = {}) {
    const { parent = '*', index = 0, container = document, timeout = 1000, } = typeof options === 'string' ? { parent: options } : options || {};
    return waitFor(async (resolve) => {
        const result = document.evaluate(`//${parent}[contains(text(),'${text}')]`, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        let element;
        let i = 0;
        while ((element = result.iterateNext())) {
            if (i === index)
                break;
            i++;
        }
        if (!element)
            throw new AssertionError({
                name: 'getByText',
                expected: `Element with text ${text}`,
                actual: element,
                pass: false,
                message: `Element with text ${text} not found`,
            });
        await verifyElementInDOM(element, { query: 'getByText' });
        resolve(element);
    }, { timeout });
}
//# sourceMappingURL=get-by-text%20copy.js.map