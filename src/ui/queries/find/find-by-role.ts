import { AssertionError } from '../../../core/assertions/index.js';
import { getByRole, Role } from '../get/get-by-role.js';

export async function findByRole<E extends Element>(
  role: Role,
  options: {
    container?: Node;
    index?: number;
    timeout?: number;
    name?: string;
    exact?: boolean;
    label?: string;
    disabled?: boolean;
    level?: number;
  } = {},
) {
  try {
    return await getByRole<E>(role, options);
  } catch (error) {
    if (error instanceof AssertionError) return null;

    throw error;
  }
}
