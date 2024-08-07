import { fireEvent } from './fire-event.js';

export const click = (selectorOrElement: string | Element) => fireEvent(selectorOrElement, 'click');
