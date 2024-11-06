import { env } from '../env.js';

export async function loginUser(username) {
  const user = env.users[username];

  if (!user) throw Error(`User ${username} not found`);

  const response = await fetch(`${env.fusionauth_url}/api/login`, {
    method: 'POST',
    body: JSON.stringify({
      applicationId: env[`application_id_${user.application}`],
      loginId: user.login_id,
      password: user.password,
    }),
    headers: {
      'content-type': 'application/json',
    },
  });

  const { token } = await response.json();

  user.sso_access_token = token;

  return token;
}
