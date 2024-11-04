import { getBySelector } from './get-by-selector.js';
export function getByTestId(id, options = {}) {
    const { testIdAttribute = 'e2e', ...rest } = options;
    return getBySelector(`[data-${testIdAttribute}="${id}"]`, rest);
}
//# sourceMappingURL=get-by-test-id.js.map