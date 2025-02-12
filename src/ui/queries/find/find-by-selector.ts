import { AssertionError } from '../../../core/assertions/index.js';
import { getBySelector } from '../get/get-by-selector.js';

export async function findBySelector<E extends Element>(
  text: string,
  options: { container?: Document | HTMLElement; timeout?: number; index?: number } = {},
) {
  try {
    return await getBySelector<E>(text, options);
  } catch (error) {
    if (error instanceof AssertionError) return null;

    throw error;
  }
}
