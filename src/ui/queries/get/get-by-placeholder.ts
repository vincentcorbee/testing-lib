import { getBySelector } from './get-by-selector.js';

export function getByPlaceholder<E extends Element>(
  placeholder: string,
  options: { container?: Document | HTMLElement; timeout?: number },
) {
  return getBySelector<E>(`[placeholder="${placeholder}"]`, options);
}
