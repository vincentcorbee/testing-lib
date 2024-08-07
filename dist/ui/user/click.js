import { fireEvent } from '../event/fire-event.js';
export function click(selectorOrElement) {
    return fireEvent(selectorOrElement, 'click');
}
//# sourceMappingURL=click.js.map