import { describe, test, user, screen } from '@e2e/index.js';

import { env } from '../env.js';
describe('Login new member', () => {
  test('it should login', async () => {
    await user.input('#loginId', env.users.new_member.login_id);
    await user.input('#password', env.users.new_member.password);
    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
