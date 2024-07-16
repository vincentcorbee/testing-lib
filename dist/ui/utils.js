import { AssertionError } from '../core/assertion.js';
import { performAction } from '../shared/perform-action.js';
export function dispatchEvent(selectorOrElement, eventType, payload = {}) {
    return performAction((resolve, reject) => {
        const element = typeof selectorOrElement === 'string'
            ? document.querySelector(selectorOrElement)
            : selectorOrElement;
        if (!element)
            throw new AssertionError({ name: 'dispatchEvent', expected: `Element with ${selectorOrElement}`, actual: element, pass: false, message: `${selectorOrElement} not found` });
        let event;
        switch (eventType) {
            case 'click':
                event = new MouseEvent(eventType, { bubbles: true, ...payload });
                break;
            case 'blur':
                event = new FocusEvent(eventType, { bubbles: true, ...payload });
                break;
            case 'change':
            case 'input':
                event = new Event(eventType, { bubbles: true, ...payload });
                break;
            case 'keyup':
                event = new KeyboardEvent(eventType, { bubbles: true, ...payload });
                break;
            default:
                break;
        }
        if (!event)
            reject(Error(`Unsupported event ${eventType}`));
        else {
            element.dispatchEvent(event);
            resolve();
        }
    });
}
//# sourceMappingURL=utils.js.map