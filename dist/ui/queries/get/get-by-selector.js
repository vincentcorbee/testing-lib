import { AssertionError } from '../../../core/assertions/index.js';
import { waitForWithResolvers } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';
export function getBySelector(selector, options = {}) {
    const { container = document, timeout = 1000 } = options;
    return waitForWithResolvers(async (resolve) => {
        const element = container.querySelector(selector);
        if (!element)
            throw new AssertionError({
                name: 'getBySelector',
                expected: `Element with selector ${selector}`,
                actual: element,
                pass: false,
                message: `Element with selector ${selector} not found`,
            });
        await verifyElementInDOM(element, { query: 'getBySelector', selector });
        resolve(element);
    }, { timeout });
}
//# sourceMappingURL=get-by-selector.js.map