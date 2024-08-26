import { AssertionError } from '../../../core/assertions/index.js';
import { waitForWithResolvers } from '../../../shared/index.js';
import { verifyElementInDOM } from '../../utils.js';
const ignoreTags = '[not(self::style or self::script)]';
const headings = '//h1|//h2|//h3|//h4|//h5|//h6';
function getHeading(level) {
    if (level === undefined)
        return headings;
    return `//h${level}`;
}
function createXpath(options) {
    const { role, name, exact = true, label, disabled = false, level } = options;
    let xpath = '';
    switch (role) {
        case 'radio':
        case 'checkbox':
        case 'button':
            xpath = `(//${role}|//body//*${ignoreTags}[@role='${role}'])`;
            break;
        case 'heading':
            xpath = `(${getHeading(level)}|//body//*${ignoreTags}[@role='${role}'])`;
            break;
        default:
            xpath = `//body//*${ignoreTags}[@role='${role}']`;
    }
    if (name)
        xpath += `[${exact ? `normalize-space()='${name}' or normalize-space(text())='${name}'` : `contains(normalize-space(),'${name}') or contains(normalize-space(text()),'${name}')`}]`;
    if (label)
        xpath += `[@aria-label='${label}']`;
    if (disabled)
        xpath += `[@disabled]`;
    return xpath;
}
export function getByRole(role, options = {}) {
    const { index = 0, container = document, timeout = 1000, ...rest } = options || {};
    return waitForWithResolvers(async (resolve) => {
        const xpath = createXpath({ role, ...rest });
        const result = document.evaluate(xpath, container, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        let element;
        let i = 0;
        while ((element = result.iterateNext())) {
            if (i === index)
                break;
            i++;
        }
        if (!element)
            throw new AssertionError({
                name: 'getByText',
                expected: `Element with role ${role}`,
                actual: element,
                pass: false,
                message: `Element with role ${role} not found`,
            });
        await verifyElementInDOM(element, { query: 'getByRole' });
        resolve(element);
    }, { timeout });
}
//# sourceMappingURL=get-by-role.js.map