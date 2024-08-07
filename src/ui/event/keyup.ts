import { fireEvent } from './fire-event.js';

export const keyup = (selectorOrElement: string | Element, key: string) =>
  fireEvent(selectorOrElement, 'keyup', { key });
