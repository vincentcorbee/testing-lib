import { describe, test, user, screen } from '@e2e/index.js';

import { env } from '../env.js';
describe('Login signer one', () => {
  test('it should login', async () => {
    await user.input('#loginId', env.users.signer_one.login_id);
    await user.input('#password', env.users.signer_one.password);
    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
