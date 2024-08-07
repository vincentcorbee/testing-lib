import { waitFor } from '../../../shared/index.js';

export function getAllByText<E extends Element = Element>(
  text: string,
  options: string | { parent?: string; container?: Node; timeout?: number } = {},
) {
  const {
    parent = '*',
    container = document,
    timeout = 1000,
  } = typeof options === 'string' ? { parent: options } : options || {};

  return waitFor<E[]>(
    (resolve) => {
      const result = document.evaluate(
        `//${parent}[contains(normalize-space(),'${text}')]`,
        container,
        null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null,
      );

      const elements: E[] = [];

      let element: E | null;

      while ((element = result.iterateNext() as E)) elements.push(element);

      resolve(elements);
    },
    { timeout },
  ) as Promise<E[]>;
}
