import { AssertionError } from '../../../core/assertions/index.js';
import { waitFor } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';

const ignoreTags = '[not(self::body or self::style or self::script)]';

const sanitizeText = (text: string) => {
  if (text.includes("'")) return `"${text}"`;
  if (text.includes('"')) return `'${text}'`;

  return `'${text}'`;
};

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

  return waitFor<E>(
    async () => {
      const sanitizedText = sanitizeText(text);
      const xpath = `//${parent}${ignoreTags}[${exact ? `normalize-space()=${sanitizedText} or normalize-space(text())=${sanitizedText}` : `contains(normalize-space(),${sanitizedText}) or contains(normalize-space(text()),${sanitizedText})`}]`;
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

      return element as E;
    },
    { timeout },
  ) as Promise<E>;
}
