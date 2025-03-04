import { AssertionError } from '../core/assertions/assertion.error.js';

export function verifyElementInDOM(
  element: Node,
  options: { query: string; selector?: string; container?: Node | Document },
) {
  const { container = document, query } = options;

  return new Promise((resolve, rejects) => {
    setTimeout(() => {
      if (container.contains(element)) resolve(true);
      else
        rejects(
          new AssertionError({
            name: query,
            expected: `Element to be attached to the DOM`,
            actual: element,
            pass: false,
            message: `Element is not attached to the DOM`,
          }),
        );
    });
  });
}
