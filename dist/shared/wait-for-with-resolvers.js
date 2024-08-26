export function waitForWithResolvers(action, options = {}) {
    const { timeout = 5000 } = options;
    const interval = 400;
    const maxRetries = Math.ceil(timeout / interval);
    const { promise, resolve, reject } = Promise.withResolvers();
    let retries = 0;
    const performAction = async () => {
        try {
            await action(resolve, reject);
        }
        catch (error) {
            if (retries >= maxRetries)
                reject(error);
            else {
                retries++;
                setTimeout(() => performAction(), interval);
            }
        }
    };
    performAction();
    return promise;
}
//# sourceMappingURL=wait-for-with-resolvers.js.map