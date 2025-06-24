import { describe, test, beforeAll } from '@e2e/index.js';
import { env } from '../env.js';
import { Postmark } from '../api/postmark.js';
describe('Email code', () => {
  let postmark: Postmark;

  beforeAll(() => {
    postmark = new Postmark({
      serverToken: env.postmark.server_token,
    });
  });
  test('it should authenticate', async () => {
    const email = await postmark.getEmail({ subject: 'Eenmalige code', recipient: env.users.non_member.login_id });

    console.log(email);
  });
});
