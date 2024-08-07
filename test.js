/**
 * @template V
 * @callback Resolve
 * @param {V} [value]
 * @returns {void}
 *
 * @callback Reject
 * @param {*} [reason]
 * @returns {void}
 *
 * @template V
 * @callback Action
 * @param {Resolve<V>} resolve
 * @param {Reject} reject
 * @returns {void | Promise<void>}
 */

/**
 * @typedef {Object} Options
 * @property {number} [timeout] - The maximum time to wait for the action to complete.
 */

/**
 * @template V
 * @param {Action<V>} action
 * @param {Options} [options={}]
 * @returns {Promise<V | undefined>}
 */
export function waitFor(action, options = {}) {
  return new Promise((resolve, reject) => {
    const { timeout = 5000 } = options;

    const interval = 400;
    const maxRetries = Math.ceil(timeout / interval);

    let retries = 0;

    const perform = async () => {
      try {
        await action(resolve, reject);
      } catch (error) {
        if (retries >= maxRetries) reject(error);
        else {
          retries++;
          setTimeout(() => perform(), interval);
        }
      }
    };

    perform();
  });
}

/**
 * @returns {Promise<string>}
 */
function test() {
  return waitFor((resolve, reject) => {
    setTimeout(() => {
      resolve('done');
    }, 5000);
  });
}
