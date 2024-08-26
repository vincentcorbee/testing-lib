import { waitForWithResolvers } from '../../shared/wait-for-with-resolvers.js';
import { fireEvent } from '../event/fire-event.js';
import { getBySelector } from '../queries/get/get-by-selector.js';
export function check(selectorOrElement, value) {
    return waitForWithResolvers(async (resolve) => {
        const element = typeof selectorOrElement === 'string' ? await getBySelector(selectorOrElement) : selectorOrElement;
        element.focus();
        await fireEvent(element, 'click');
        await fireEvent(element, 'change', { target: { value } });
        resolve();
    });
}
//# sourceMappingURL=check.js.map