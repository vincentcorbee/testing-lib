export function waitFor(action, options = {}) {
    const { timeout = 5000 } = options;
    const interval = 400;
    const maxRetries = Math.ceil(timeout / interval);
    return new Promise((resolve, reject) => {
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
    });
}
//# sourceMappingURL=wait-for.js.map