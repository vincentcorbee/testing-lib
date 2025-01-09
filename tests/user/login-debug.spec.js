import { describe, test, user, screen } from '../../dist/index.js';

import { env } from '../env.js';
describe('Login debug user', () => {
  test('it should login a debug user', async () => {
    await user.input('#loginId', env.users.debug.login_id);
    await user.input('#password', env.users.debug.password);

    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
