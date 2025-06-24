import { expect, screen, waitFor } from '@e2e/index.js';

export async function waitForPageload() {
  await screen.getByText('Bezig met laden...');
  await waitFor(async () => await expect(screen.findByText('Bezig met laden...')).resolves.toEqual(null));
}

export const getRegistrationIdFromPath = (pathname) => {
  const result = pathname.match(/^\/membership-registration(?=\/)(?:\/([^/]+)?)/);

  if (result === null) return null;

  return result[1] ?? null;
};
