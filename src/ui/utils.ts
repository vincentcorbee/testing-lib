import { AssertionError } from '../core/assertions/assertion.error.js';

export function verifyElementInDOM(element: Node, options: { query: string; selector?: string }) {
  return new Promise((resolve, rejects) => {
    setTimeout(() => {
      if (document.body.contains(element)) resolve(true);
      else
        rejects(
          new AssertionError({
            name: options.query,
            expected: `Element to be attached to the DOM`,
            pass: false,
            message: `Element is not attached to the DOM`,
          }),
        );
    });
  });
}
