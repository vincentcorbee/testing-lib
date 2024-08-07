import { fireEvent } from './fire-event.js';

export const blur = (selectorOrElement: string | Element) => fireEvent(selectorOrElement, 'blur');
