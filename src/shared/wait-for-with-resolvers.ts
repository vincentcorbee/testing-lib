export function waitForWithResolvers<V = undefined>(
  action: (resolve: (value?: V | PromiseLike<V>) => void, reject: (reason?: any) => void) => void | Promise<void>,
  options: { timeout?: number } = {},
): Promise<V | undefined> {
  return new Promise((resolve, reject) => {
    const { timeout = 5000 } = options;

    const interval = 400;
    const end = performance.now() + timeout;

    const performAction = async () => {
      try {
        await action(resolve, reject);
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
