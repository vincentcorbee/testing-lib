import { AssertionError } from '../../core/assertions/index.js';
import { waitFor } from '../../shared/index.js';
export function getByText(text, options = {}) {
    const { parent = '*', index = 0, container = document, timeout = 1000, } = typeof options === 'string' ? { parent: options } : options || {};
    return waitFor((resolve) => {
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
                message: `${text} not found`,
            });
        resolve(element);
    }, { timeout });
}
//# sourceMappingURL=get-by-text.js.map