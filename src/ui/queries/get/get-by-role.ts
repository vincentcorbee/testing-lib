import { AssertionError } from '../../../core/assertions/index.js';
import { waitFor } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';

type Role = 'button' | 'heading';

const ignoreScriptTag = '[not(self::script)]';
const headings = '//h1|//h2|//h3|//h4|//h5|//h6';

function createXpath(role: Role, name?: string) {
  let xpath = '';

  switch (role) {
    case 'button':
      xpath = `(//${role}|//*${ignoreScriptTag}[@role='${role}'])`;
      break;
    case 'heading':
      xpath = `(${headings}|//*${ignoreScriptTag}[@role='${role}'])`;
      break;
    default:
      xpath = `//*${ignoreScriptTag}[@role='${role}']`;
  }

  if (name) xpath += `[contains(normalize-space(.),'${name}')]`;

  return xpath;
}

export function getByRole<E extends Element>(
  role: Role,
  options: { container?: Node; index?: number; timeout?: number; name?: string } = {},
) {
  const { index = 0, container = document, timeout = 1000 } = options || {};

  return waitFor<E>(
    async (resolve) => {
      const xpath = createXpath(role, options.name);
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
          expected: `Element with role ${role}`,
          actual: element,
          pass: false,
          message: `Element with role ${role} not found`,
        });

      await verifyElementInDOM(element, { query: 'getByRole' });

      resolve(element as E);
    },
    { timeout },
  ) as Promise<E>;
}
