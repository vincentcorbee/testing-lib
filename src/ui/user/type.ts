import { waitForWithResolvers } from '../../shared/wait-for-with-resolvers.js';
import { wait } from '../../shared/wait.js';
import { fireEvent } from '../event/fire-event.js';
import { getCode } from '../get-code.js';
import { getBySelector } from '../queries/get/get-by-selector.js';

export function type(
  selectorOrElement: string | HTMLInputElement,
  value: string,
  options: { min?: number; max?: number } = {},
) {
  const { min = 50, max = 130 } = options;

  return waitForWithResolvers(async (resolve, reject) => {
    if (value && value.length > 0) {
      const element =
        typeof selectorOrElement === 'string'
          ? await getBySelector<HTMLInputElement>(selectorOrElement)
          : selectorOrElement;

      let index = 0;
      let typed = '';

      element.focus();

      while (index < value.length) {
        try {
          await wait(Math.max(Math.random() * max, min));

          const codePoint = value.codePointAt(index)!;
          const key = String.fromCodePoint(codePoint);
          const code = getCode(key);

          await fireEvent(element, 'keydown', { key, code });

          typed += key;

          await fireEvent(element, 'input', { target: { value: typed } });
          await fireEvent(element, 'keyup', { key, code });

          index += key.length;
        } catch (error) {
          reject(error);
        }
      }

      await fireEvent(element, 'change', { target: { value } });

      resolve();
    } else {
      resolve();
    }
  });
}
