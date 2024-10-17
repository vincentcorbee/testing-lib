import { AssertionError } from '../../../core/assertions/index.js';
import { waitFor } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';
const ignoreTags = '[not(self::body or self::style or self::script)]';
export function getByText(text, options = {}) {
    const { parent = '*', index = 0, container = document, timeout = 1000, exact = true, } = typeof options === 'string' ? { parent: options } : options || {};
    return waitFor(async () => {
        const xpath = `//${parent}${ignoreTags}[${exact ? `normalize-space()='${text}' or normalize-space(text())='${text}'` : `contains(normalize-space(),'${text}') or contains(normalize-space(text()),'${text}')`}]`;
        const result = document.evaluate(xpath, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
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
        return element;
    }, { timeout });
}
//# sourceMappingURL=get-by-text.js.map