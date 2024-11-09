export function waitFor<V = undefined>(action: () => Promise<V> | V, options: { timeout?: number } = {}): Promise<V> {
  return new Promise((resolve, reject) => {
    const { timeout = 5000 } = options;

    const interval = 400;
    const end = performance.now() + timeout;

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
  });
}
