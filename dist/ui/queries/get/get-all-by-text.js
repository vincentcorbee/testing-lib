import { waitForWithResolvers } from '../../../shared/index.js';
const ignoreTags = '[not(self::body or self::style or self::script)]';
export function getAllByText(text, options = {}) {
    const { parent = '*', container = document, timeout = 1000, exact = true, } = typeof options === 'string' ? { parent: options } : options || {};
    return waitForWithResolvers((resolve) => {
        const xpath = `//${parent}${ignoreTags}[${exact ? `normalize-space()='${text}' or normalize-space(text())='${text}'` : `contains(normalize-space(),'${text}') or contains(normalize-space(text()),'${text}')`}]`;
        const result = document.evaluate(xpath, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        const elements = [];
        let element;
        while ((element = result.iterateNext()))
            elements.push(element);
        resolve(elements);
    }, { timeout });
}
//# sourceMappingURL=get-all-by-text.js.map