import { getBySelector } from './get-by-selector.js';
import { getByText } from './get-by-text.js';

export async function getByLabel(text: string, options: { container?: Node; timeout?: number } = {}) {
  const { container = document, timeout = 1000 } = options;

  const label = await getByText<HTMLLabelElement>(text, { container, parent: 'label', timeout });

  return getBySelector<HTMLInputElement>(`#${label.htmlFor}`, { timeout });
}
