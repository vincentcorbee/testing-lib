import { AssertionError } from '../../../core/assertions/index.js';
import { waitFor } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';

export function getByText<E extends Element>(
  text: string,
  options: string | { parent?: string; container?: Node; index?: number; timeout?: number } = {},
) {
  const {
    parent = '*',
    index = 0,
    container = document,
    timeout = 1000,
  } = typeof options === 'string' ? { parent: options } : options || {};

  return waitFor<E>(
    async (resolve) => {
      const xpath = `//${parent}[not(self::script)][contains(normalize-space(text()),'${text}')]`;
      const result = document.evaluate(xpath, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

      let element: Node | null;

      let i = 0;

      while ((element = result.iterateNext())) {
        if (i === index) break;

        i++;
      }

      if (!element)
        throw new AssertionError({
          name: 'getByText',
          expected: `Element with text ${text}`,
          actual: element,
          pass: false,
          message: `Element with text ${text} not found`,
        });

      await verifyElementInDOM(element, { query: 'getByText' });

      resolve(element as E);
    },
    { timeout },
  ) as Promise<E>;
}
