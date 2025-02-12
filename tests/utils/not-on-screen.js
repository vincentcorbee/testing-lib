import { expect, screen, waitFor } from '../../dist/index.js';

export async function notOnScreen(selectorOrElement) {
  const element =
    typeof selectorOrElement === 'string' ? await screen.findBySelector(selectorOrElement) : selectorOrElement;

  await waitFor(expect(element).not.toBeVisible);
}
