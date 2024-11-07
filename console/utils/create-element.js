/**
 *
 * @param { string } type
 * @param { Record<string, any> | null } [props]
 * @param { Node[] | null } [children]
 * @param { { is?: string, ns?: string } } [options]
 * @returns
 */
export function createElement(type, props, children, options) {
  const element = document.createElement(type);

  if (props) {
    Object.entries(props).forEach(([key, val]) => {
      if (key === 'dataset') {
        Object.entries(val).forEach(([k, v]) => (element.dataset[k] = v));
      } else if (key in element) {
        element[key] = val;
      } else {
        element.setAttribute(key, val);
      }
    });
  }

  if (children) children.forEach((child) => element.appendChild(child));

  return element;
}
