import { AssertionError } from '../../../core/assertions/index.js';
import { waitFor } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';

export function getByXpath<E extends Element>(
  expression: string,
  options: { container?: Node; index?: number; timeout?: number; name?: string } = {},
) {
  const { index = 0, container = document, timeout = 1000 } = options || {};

  return waitFor<E>(
    async () => {
      const result = document.evaluate(expression, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

      let element: Node | null;

      let i = 0;

      while ((element = result.iterateNext())) {
        if (i === index) break;

        i++;
      }

      if (!element)
        throw new AssertionError({
          name: 'getByXpath',
          expected: `Element with expression ${expression}`,
          actual: element,
          pass: false,
          message: `Element with expression ${expression} not found`,
        });

      await verifyElementInDOM(element, { query: 'getByExpression' });

      return element as E;
    },
    { timeout },
  );
}
