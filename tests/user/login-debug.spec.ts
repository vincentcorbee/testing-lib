import { describe, test, user, screen } from '@e2e/index.js';

import { env } from '../env.js';
describe('Login debug', () => {
  test('it should login', async () => {
    await user.input('#loginId', env.users.debug.login_id);
    await user.input('#password', env.users.debug.password);
    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
