export function waitForWithResolvers(action, options = {}) {
    const { timeout = 5000 } = options;
    const interval = 400;
    const end = performance.now() + timeout;
    const { promise, resolve, reject } = Promise.withResolvers();
    const performAction = async () => {
        try {
            await action(resolve, reject);
        }
        catch (error) {
            if (performance.now() > end)
                reject(error);
            else {
                setTimeout(() => performAction(), interval);
            }
        }
    };
    performAction();
    return promise;
}
//# sourceMappingURL=wait-for-with-resolvers.js.map