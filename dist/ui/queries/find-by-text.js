import { AssertionError } from '../../core/assertions/index.js';
import { getByText } from './get-by-text.js';
export async function findByText(text, options = {}) {
    const { parent = '*', index = 0, container = document, timeout = 1000, } = typeof options === 'string' ? { parent: options } : options || {};
    try {
        return await getByText(text, { parent, index, container, timeout });
    }
    catch (error) {
        if (error instanceof AssertionError)
            return null;
        throw error;
    }
}
//# sourceMappingURL=find-by-text.js.map