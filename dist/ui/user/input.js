import { waitForWithResolvers } from '../../shared/wait-for-with-resolvers.js';
import { fireEvent } from '../event/fire-event.js';
import { getBySelector } from '../queries/get/get-by-selector.js';
export function input(selectorOrElement, value) {
    return waitForWithResolvers(async (resolve) => {
        const element = typeof selectorOrElement === 'string' ? await getBySelector(selectorOrElement) : selectorOrElement;
        element.focus();
        await fireEvent(element, 'input');
        await fireEvent(element, 'change', { target: { value } });
        resolve();
    });
}
//# sourceMappingURL=input.js.map