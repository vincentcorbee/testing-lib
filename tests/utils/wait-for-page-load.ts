import { expect, screen, waitFor } from '@e2e/index.js';

export async function waitForPageload(text = 'Bezig met laden...') {
  await screen.getByText(text);

  await waitFor(async () => await expect(screen.findByText(text)).resolves.toEqual(null));
}
