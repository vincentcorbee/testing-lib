import { createElement } from '../utils/createElement.js';

/**
 * @param {{ props?: Record<string, any>, children?: Node[] }} args
 * @returns {HTMLDivElement}
 */
export function Block(args) {
  return createElement('div', args);
}
