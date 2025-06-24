import { describe, test, user, screen } from '@e2e/index.js';

import { env } from '../env.js';
describe('Login backstage', () => {
  test('it should login', async () => {
    await user.input('#loginId', env.users.backstage.login_id);
    await user.input('#password', env.users.backstage.password);
    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
