import { AssertionError } from '../../core/assertions/assertion.error.js';
import { isElementVisble } from '../../shared/is-element-visible.js';
import { waitFor } from '../../shared/wait-for.js';
export function isVisible(element, options) {
    const { timeout } = options ?? {};
    return waitFor(() => {
        if (!isElementVisble(element)) {
            throw new AssertionError({
                name: 'isVisible',
                expected: 'visible',
                actual: 'hidden',
                message: `Expected element to be visible`,
                pass: false,
            });
        }
        return true;
    }, { timeout });
}
//# sourceMappingURL=is-visible.js.map