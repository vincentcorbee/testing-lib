import { AssertionError } from '../../../core/assertions/index.js';
import { waitFor } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';

export function getBySelector<E extends Element = Element>(
  selector: string,
  options: { container?: Document | HTMLElement; timeout?: number } = {},
): Promise<E> {
  const { container = document, timeout = 1000 } = options;

  return waitFor<E>(
    async () => {
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

      return element as E;
    },
    { timeout },
  );
}
