import { describe, test, expect, event, screen, request } from '../../../dist/index.js';

describe('Registration already started', () => {
  test('should not be able to start a registration', async () => {
    // const watcher = request.waitForRequest('/graphql', async (request) => {
    //   if (!request.body.includes('startAuthorRegistrationAsOwner')) return false;

    //   const response = await request.json();

    //   if (response.errors === undefined) return false;

    //   const [error] = response.errors;

    //   return error.message === 'Registration has already started';
    // });

    await event.click(await screen.getByText('Auteur'));
    await event.click(await screen.getByText('Voor mezelf'));
    // await expect(watcher).resolves.toEqual(true);
  });

  test('Should show error message', async () => {
    await screen.getByText('Je bent al een actief lid van BumaStemra.');
  });
});
