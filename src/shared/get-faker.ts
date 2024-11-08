import { env } from './env.js';
import { waitForWithResolvers } from './wait-for-with-resolvers.js';

export function getFaker() {
  if (env === 'node') {
    /* Not implemented */
    return Promise.resolve({});
  } else {
    if (!document.getElementById('faker-js')) {
      const scriptTag = document.createElement('script');

      scriptTag.id = 'faker-js';
      scriptTag.type = 'module';
      scriptTag.innerHTML = `
      import { fakerNL } from 'https://cdn.jsdelivr.net/npm/@faker-js/faker@8.4.1/+esm';
      window.faker = fakerNL;`;

      document.head.appendChild(scriptTag);
    }
  }

  return waitForWithResolvers((resolve) => {
    if (globalThis.faker) resolve(globalThis.faker);
    else throw Error('Faker not found');
  });
}
