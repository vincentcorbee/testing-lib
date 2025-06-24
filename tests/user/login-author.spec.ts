import { describe, test, user, screen } from '@e2e/index.js';

import { env } from '../env.js';
describe('Login author', () => {
  test('it should login', async () => {
    await user.input('#loginId', env.users.author.login_id);
    await user.input('#password', env.users.author.password);
    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
