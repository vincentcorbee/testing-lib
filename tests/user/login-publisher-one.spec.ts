import { describe, test, user, screen } from '@e2e/index.js';

import { env } from '../env.js';
describe('Login publisher one', () => {
  test('it should login', async () => {
    await user.input('#loginId', env.users.publisher_one.login_id);
    await user.input('#password', env.users.publisher_one.password);
    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
