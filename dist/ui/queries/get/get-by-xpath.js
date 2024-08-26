import { AssertionError } from '../../../core/assertions/index.js';
import { waitForWithResolvers } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';
export function getByXpath(expression, options = {}) {
    const { index = 0, container = document, timeout = 1000 } = options || {};
    return waitForWithResolvers(async (resolve) => {
        const result = document.evaluate(expression, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        let element;
        let i = 0;
        while ((element = result.iterateNext())) {
            if (i === index)
                break;
            i++;
        }
        if (!element)
            throw new AssertionError({
                name: 'getByXpath',
                expected: `Element with expression ${expression}`,
                actual: element,
                pass: false,
                message: `Element with expression ${expression} not found`,
            });
        await verifyElementInDOM(element, { query: 'getByExpression' });
        resolve(element);
    }, { timeout });
}
//# sourceMappingURL=get-by-xpath.js.map