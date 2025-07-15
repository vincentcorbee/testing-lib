import { env } from '../env.js';

export async function loginUser(username: string) {
  const user = env.users[username];

  if (!user) throw Error(`User ${username} not found`);

  const responseUser = await fetch(`${env.sso.url}/api/user/${user.user_id}`, {
    method: 'GET',
    headers: {
      Authorization: env.sso.key,
      'content-type': 'application/json',
    },
  });

  if (responseUser.status !== 200) throw Error(`User ${username} not found`);

  const {
    user: { firstName, lastName, middleName, fullName, language, preferredLanguages, registrations, email },
  } = await responseUser.json();

  const response = await fetch(`${env.sso.url}/api/jwt/vend`, {
    method: 'POST',
    body: JSON.stringify({
      keyId: env.sso.key_id,
      claims: {
        sub: user.user_id,
        firstName,
        lastName,
        middleName,
        fullName,
        language,
        preferredLanguages,
        email,
        registrations: registrations.map(({ roles, applicationId }) => ({ roles, applicationId })),
      },
    }),
    headers: {
      Authorization: env.sso.key,
      'content-type': 'application/json',
    },
  });

  const { token } = await response.json();

  user.sso_access_token = token;

  return token;
}
