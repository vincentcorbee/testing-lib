import { navigationSubject } from '../subjects.js';

export async function waitForNavigation(path: string | RegExp, options: { timeout?: number } = {}) {
  const { timeout = 3000 } = options;

  return new Promise((resolve, reject) => {
    let called = false;

    const subscription = navigationSubject.subscribe({
      next: async (data) => {
        try {
          called = true;

          const pathname = data.url;

          resolve(typeof path === 'string' ? pathname === path : path.test(pathname ?? ''));
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

        resolve(Error(`Timeout on navigation: ${path}`));
      }
    }, timeout);
  });
}
