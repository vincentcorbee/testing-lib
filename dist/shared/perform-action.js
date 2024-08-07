export function waitFor(action, options = {}) {
  return new Promise((resolve, reject) => {
    const maxRetries = 5;
    let retries = 0;
    const perform = async () => {
      try {
        await action(resolve, reject);
      } catch (error) {
        if (retries >= maxRetries) reject(error);
        else {
          retries++;
          setTimeout(() => perform(), 400);
        }
      }
    };
    perform();
  });
}
//# sourceMappingURL=perform-action.js.map
