import { getBySelector } from './get-by-selector.js';

export function getByTestId<E extends Element>(
  id: string,
  options: { container?: Document | HTMLElement; timeout?: number },
) {
  return getBySelector<E>(`[data-e2e="${id}"]`, options);
}
