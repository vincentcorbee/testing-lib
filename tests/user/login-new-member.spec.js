import { describe, test, user, screen } from '../../dist/index.js';

import { env } from '../env.js';
describe('Login new member', () => {
  test('it should login a new member user', async () => {
    await user.input('#loginId', env.users.new_member.login_id);
    await user.input('#password', env.users.new_member.password);

    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
