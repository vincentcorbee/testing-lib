import { RequestEvent, requestSubject } from '../../shared/index.js';

export async function waitForRequest(
  path: string,
  predicate: (data: RequestEvent) => boolean | Promise<boolean>,
  options: { timeout?: number } = {},
) {
  const { timeout = 3000 } = options;

  return new Promise((resolve, reject) => {
    let called = false;

    const subscription = requestSubject.subscribe({
      next: async (data) => {
        try {
          called = true;

          if (data.url.pathname === path) {
            if (typeof predicate === 'function') {
              resolve(await predicate(data));
            } else resolve(true);
          } else resolve(false);
        } catch (error) {
          reject(error);
        } finally {
          subscription.unsubscribe();
        }
      },
    });

    setTimeout(() => {
      if (!called) {
        subscription.unsubscribe();

        resolve(Error(`Timeout on request: ${path}`));
      }
    }, timeout);
  });
}
