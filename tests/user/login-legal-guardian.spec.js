import { describe, test, user, screen } from '../../dist/index.js';

import { env } from '../env.js';
describe('Login new member', () => {
  test('it should login a new member user', async () => {
    await user.input('#loginId', env.users.legal_guardian.login_id);
    await user.input('#password', env.users.legal_guardian.password);

    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
