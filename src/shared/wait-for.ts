export function waitFor<V = undefined>(action: () => Promise<V> | V, options: { timeout?: number } = {}): Promise<V> {
  const { timeout = 5000 } = options;

  const interval = 400;
  const end = performance.now() + timeout;

  const { promise, resolve, reject } = Promise.withResolvers<V>();

  const performAction = async () => {
    try {
      resolve(await action());
    } catch (error) {
      if (performance.now() > end) reject(error);
      else {
        setTimeout(() => performAction(), interval);
      }
    }
  };

  performAction();

  return promise;
}
