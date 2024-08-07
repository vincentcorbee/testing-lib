import { AssertionError } from '../../core/assertions/index.js';
import { waitFor } from '../../shared/index.js';
export function getBySelector(selector, options = {}) {
    const { container = document, timeout = 1000 } = options;
    return waitFor((resolve) => {
        const element = container.querySelector(selector);
        if (!element)
            throw new AssertionError({
                name: 'getBySelector',
                expected: `Element with selector ${selector}`,
                actual: element,
                pass: false,
                message: `${selector} not found`,
            });
        resolve(element);
    }, { timeout });
}
//# sourceMappingURL=get-by-selector.js.map