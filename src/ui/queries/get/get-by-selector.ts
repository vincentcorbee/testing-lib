import { AssertionError } from '../../../core/assertions/index.js';
import { waitForWithResolvers } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';

export function getBySelector<E extends Element = Element>(
  selector: string,
  options: { container?: Document | HTMLElement; timeout?: number } = {},
) {
  const { container = document, timeout = 1000 } = options;

  return waitForWithResolvers(
    async (resolve) => {
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

      resolve(element as E);
    },
    { timeout },
  ) as Promise<E>;
}
