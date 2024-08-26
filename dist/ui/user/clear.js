import { waitForWithResolvers } from '../../shared/wait-for-with-resolvers.js';
import { fireEvent } from '../event/fire-event.js';
import { getBySelector } from '../queries/get/get-by-selector.js';
export function clear(selectorOrElement, options = {}) {
    const { min = 50, max = 100 } = options;
    return waitForWithResolvers(async (resolve, reject) => {
        const element = typeof selectorOrElement === 'string'
            ? await getBySelector(selectorOrElement)
            : selectorOrElement;
        const { value } = element;
        const { length } = value;
        if (length === 0)
            return resolve();
        let reversed = '';
        for (const char of value)
            reversed = char + reversed;
        let index = 0;
        const interval = setInterval(() => {
            try {
                index += String.fromCodePoint(reversed.codePointAt(index)).length;
                fireEvent(element, 'keydown', { key: 'Backspace', code: 'Backspace' });
                element.value = value.slice(0, length - index);
                fireEvent(element, 'input');
                if (index >= reversed.length) {
                    clearInterval(interval);
                    fireEvent(element, 'keyup', { key: 'Backspace', code: 'Backspace' });
                    fireEvent(element, 'change');
                    resolve();
                }
            }
            catch (error) {
                clearInterval(interval);
                reject(error);
            }
        }, Math.max(Math.random() * max, min));
    });
}
//# sourceMappingURL=clear.js.map