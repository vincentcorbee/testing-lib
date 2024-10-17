import { AssertionError } from '../../../core/assertions/index.js';
import { waitFor } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';
export function getBySelector(selector, options = {}) {
    const { container = document, timeout = 1000 } = options;
    return waitFor(async () => {
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
        return element;
    }, { timeout });
}
//# sourceMappingURL=get-by-selector.js.map