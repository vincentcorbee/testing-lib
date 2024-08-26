import { AssertionError } from '../../../core/assertions/index.js';
import { waitForWithResolvers } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';

const ignoreTags = '[not(self::body or self::style or self::script)]';

export function getByText<E extends Element>(
  text: string,
  options: string | { parent?: string; container?: Node; index?: number; timeout?: number; exact?: boolean } = {},
) {
  const {
    parent = '*',
    index = 0,
    container = document,
    timeout = 1000,
    exact = true,
  } = typeof options === 'string' ? { parent: options } : options || {};

  return waitForWithResolvers<E>(
    async (resolve) => {
      const xpath = `//${parent}${ignoreTags}[${exact ? `normalize-space()='${text}' or normalize-space(text())='${text}'` : `contains(normalize-space(),'${text}') or contains(normalize-space(text()),'${text}')`}]`;
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
