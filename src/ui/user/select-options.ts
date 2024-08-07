import { input } from './input.js';

export function selectOptions(selectorOrElement: HTMLSelectElement | string, value: any) {
  return input(selectorOrElement, value);
}
