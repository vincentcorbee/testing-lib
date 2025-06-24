import { describe, test, user, screen } from '@e2e/index.js';

import { env } from '../env.js';
describe('Login legal guardian', () => {
  test('it should login', async () => {
    await user.input('#loginId', env.users.legal_guardian.login_id);
    await user.input('#password', env.users.legal_guardian.password);
    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
