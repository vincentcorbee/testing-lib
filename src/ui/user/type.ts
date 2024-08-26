import { waitForWithResolvers } from '../../shared/wait-for-with-resolvers.js';
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
    const element =
      typeof selectorOrElement === 'string'
        ? await getBySelector<HTMLInputElement>(selectorOrElement)
        : selectorOrElement;

    let index = 0;
    let typed = '';

    const interval = setInterval(
      async () => {
        try {
          const codePoint = value.codePointAt(index)!;
          const key = String.fromCodePoint(codePoint);
          const code = getCode(key);

          await fireEvent(element, 'keydown', { key, code });

          typed += key;

          await fireEvent(element, 'input', { target: { value: typed } });
          await fireEvent(element, 'keyup', { key, code });

          index += key.length;

          if (index >= value.length) {
            clearInterval(interval);

            await fireEvent(element, 'change', { target: { value } });

            resolve();
          }
        } catch (error) {
          clearInterval(interval);

          reject(error);
        }
      },
      Math.max(Math.random() * max, min),
    );
  });
}
