import { describe, test, expect } from '@e2e/index.js';

import { loginUser } from 'utils/login-user.js';
describe('Login', () => {
  test('it should login backstage', async () => {
    const token = await loginUser('backstage');

    console.log('Token:', token);

    expect(token).toBeDefined();
  });
});
