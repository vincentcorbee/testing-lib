import { waitForWithResolvers } from '../../../shared/index.js';

const ignoreTags = '[not(self::body or self::style or self::script)]';

export function getAllByText<E extends Element = Element>(
  text: string,
  options: string | { parent?: string; container?: Node; timeout?: number; exact?: boolean } = {},
) {
  const {
    parent = '*',
    container = document,
    timeout = 1000,
    exact = true,
  } = typeof options === 'string' ? { parent: options } : options || {};

  return waitForWithResolvers<E[]>(
    (resolve) => {
      const xpath = `//${parent}${ignoreTags}[${exact ? `normalize-space()='${text}' or normalize-space(text())='${text}'` : `contains(normalize-space(),'${text}') or contains(normalize-space(text()),'${text}')`}]`;
      const result = document.evaluate(xpath, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

      const elements: E[] = [];

      let element: E | null;

      while ((element = result.iterateNext() as E)) elements.push(element);

      resolve(elements);
    },
    { timeout },
  ) as Promise<E[]>;
}
