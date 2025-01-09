import { describe, test, user, screen } from '../../dist/index.js';

import { env } from '../env.js';
describe('Login manager', () => {
  test('it should login a manager user', async () => {
    await user.input('#loginId', env.users.manager.login_id);
    await user.input('#password', env.users.manager.password);

    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
