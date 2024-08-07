import { fireEvent } from '../event/fire-event.js';

export function click(selectorOrElement: string | Element) {
  return fireEvent(selectorOrElement, 'click');
}
