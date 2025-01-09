import { expect, user, page, screen, request } from '../../../dist/index.js';
import { waitForPageload } from '../helpers.js';

export async function clickStartRegistrationAsManager() {
  await user.click('#authorCard');
  await user.click(await screen.getByRole('button', { name: 'Voor een ander' }));
}

export async function startAuthorAsManagerRegistration() {
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
  await waitForPageload();
  await screen.getByRole('heading', { name: 'Start je registratie' });
}
