import { AssertionError } from '../../../core/assertions/index.js';
import { getByText } from '../get/get-by-text.js';

export async function findByText<E extends Element>(
  text: string,
  options: string | { parent?: string; container?: Node; index?: number; timeout?: number } = {},
) {
  const {
    parent = '*',
    index = 0,
    container = document,
    timeout = 1000,
  } = typeof options === 'string' ? { parent: options } : options || {};

  try {
    return await getByText<E>(text, { parent, index, container, timeout });
  } catch (error) {
    if (error instanceof AssertionError) return null;

    throw error;
  }
}
