import { describe, test, user, screen } from '../../dist/index.js';

import { env } from '../env.js';
describe('Login author', () => {
  test('it should login an author user', async () => {
    await user.input('#loginId', env.users.author.login_id);
    await user.input('#password', env.users.author.password);

    await user.click(await screen.getByText('Inloggen', 'button'));
  });
});
