import { waitFor } from '../../../shared/index.js';
export function getAllByText(text, options = {}) {
    const { parent = '*', container = document, timeout = 1000, } = typeof options === 'string' ? { parent: options } : options || {};
    return waitFor((resolve) => {
        const result = document.evaluate(`//${parent}[contains(normalize-space(),'${text}')]`, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        const elements = [];
        let element;
        while ((element = result.iterateNext()))
            elements.push(element);
        resolve(elements);
    }, { timeout });
}
//# sourceMappingURL=get-all-by-text.js.map