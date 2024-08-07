import { getBySelector } from './get-by-selector.js';
export function getByTestId(id, options) {
    return getBySelector(`[data-e2e="${id}"]`, options);
}
//# sourceMappingURL=get-by-test-id.js.map