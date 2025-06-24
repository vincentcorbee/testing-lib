import { expect, user, page, screen, request } from '@e2e/index.js';

export async function clickStartRegistrationAsManager() {
  await user.click('#author');
  await user.click(await screen.getByRole('button', { name: 'Voor een ander' }));
}

export async function startAuthorAsOtherRegistration() {
  await clickStartRegistrationAsManager();
  await expect(
    request.waitForRequest('/graphql', async (request) => {
      if (!request.body.includes('startAuthorRegistrationAsManager')) return false;

      const response = await request.json();

      if (response.errors !== undefined) return false;

      return true;
    }),
  ).resolves.toEqual(true);

  await page.location(/overview$/);
  await screen.getByRole('heading', { name: 'Start je registratie' });
}
