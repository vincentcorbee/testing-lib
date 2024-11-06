/**
 *
 * @param {HTMLElement} parent
 * @param  {Node[]} children
 * @returns
 */
export function append(parent, ...children) {
  children.forEach((child) => parent.appendChild(child));

  return parent;
}
