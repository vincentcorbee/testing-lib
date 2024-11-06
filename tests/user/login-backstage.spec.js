import { describe, test, user, screen } from '../../dist/index.js';

import { env } from '../env.js';
describe('Login author', () => {
  test('it should login a backstage user', async () => {
    await user.input('#loginId', env.users.backstage.login_id);
    await user.input('#password', env.users.backstage.password);

    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
