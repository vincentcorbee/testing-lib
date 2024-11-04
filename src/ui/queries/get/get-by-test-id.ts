import { getBySelector } from './get-by-selector.js';

export function getByTestId<E extends Element>(
  id: string,
  options: { container?: Document | HTMLElement; timeout?: number; testIdAttribute?: string } = {},
) {
  const { testIdAttribute = 'e2e', ...rest } = options;
  return getBySelector<E>(`[data-${testIdAttribute}="${id}"]`, rest);
}
