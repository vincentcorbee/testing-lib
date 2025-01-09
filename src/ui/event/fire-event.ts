import { waitForWithResolvers } from '../../shared/wait-for-with-resolvers.js';
import { getBySelector } from '../queries/get/get-by-selector.js';
import { verifyElementInDOM } from '../utils.js';

export function fireEvent(selectorOrElement: string | Element, eventType: string, payload: any = {}) {
  return waitForWithResolvers(async (resolve, reject) => {
    const element = typeof selectorOrElement === 'string' ? await getBySelector(selectorOrElement) : selectorOrElement;

    let event: Event | MouseEvent | FocusEvent | KeyboardEvent | undefined;

    const { target, ...rest } = payload;

    switch (eventType) {
      case 'click':
        event = new MouseEvent(eventType, { bubbles: true, ...rest });
        break;
      case 'blur':
      case 'focus':
        event = new FocusEvent(eventType, { bubbles: true, ...rest });
        break;
      case 'change':
      case 'input':
        event = new Event(eventType, { bubbles: true, ...rest });

        if (target?.value !== undefined) {
          /* To trigger event in React */
          const nativeInputValueSetter = Reflect.getOwnPropertyDescriptor(
            Reflect.getPrototypeOf(element)!,
            'value',
          )?.set;

          if (nativeInputValueSetter) nativeInputValueSetter.call(element, target.value);
        }

        break;
      case 'keyup':
      case 'keydown':
        event = new KeyboardEvent(eventType, { bubbles: true, ...rest });
        break;
      default:
        break;
    }

    if (!event) reject(Error(`Unsupported event ${eventType}`));
    else {
      await verifyElementInDOM(element, { query: 'fireEvent' });

      element.addEventListener(eventType, () => resolve(), { once: true });

      element.dispatchEvent(event);
    }
  });
}
