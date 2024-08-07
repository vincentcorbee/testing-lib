import { getBySelector } from './get-by-selector.js';
import { getByText } from './get-by-text.js';
export async function getByLabel(text, options = {}) {
    const { container = document, timeout = 1000 } = options;
    const label = await getByText(text, { container, parent: 'label', timeout });
    return getBySelector(`#${label.htmlFor}`, { timeout });
}
//# sourceMappingURL=get-by-label.js.map