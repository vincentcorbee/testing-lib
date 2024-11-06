/**
 *
 * @param {string} name
 * @param {Record<string, any> | null} [props]
 * @param {{ is?: string, ns?: string }} [options]
 * @returns
 */
export function createElement(name, props, options) {
  const element = document.createElement(name);

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

  return element;
}
