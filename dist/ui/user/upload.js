import { waitForWithResolvers } from '../../shared/wait-for-with-resolvers.js';
import { fireEvent } from '../event/fire-event.js';
import { getBySelector } from '../queries/get/get-by-selector.js';
export function upload(selectorOrElement, ...files) {
    return waitForWithResolvers(async (resolve) => {
        const element = typeof selectorOrElement === 'string'
            ? await getBySelector(selectorOrElement)
            : selectorOrElement;
        const dataTransfer = new DataTransfer();
        files.forEach((file) => dataTransfer.items.add(file));
        element.files = dataTransfer.files;
        await fireEvent(element, 'change');
        resolve();
    });
}
//# sourceMappingURL=upload.js.map