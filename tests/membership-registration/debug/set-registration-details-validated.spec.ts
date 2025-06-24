import { describe, test, expect, beforeAll, navigation } from '@e2e/index.js';
import { loginUser } from '../../utils/index.js';
import { GraphQL } from '../../api/graphql.js';

import { env } from '../../env.js';
import { getRegistrationIdFromPath } from '../helpers.js';

describe('Set registration details validated', () => {
  let graphQL;

  beforeAll(async () => {
    await loginUser('debug');

    graphQL = new GraphQL({
      graphqlEndpoint: env.graphql_endpoint,
      ssoAccessToken: env.users.non_member.sso_access_token,
      ssoAccessTokenBackstage: env.users.backstage.sso_access_token,
      ssoAccessTokenDebug: env.users.debug.sso_access_token,
    });
  });
  test('should set the registration state registration details validated', async () => {
    const registrationId = getRegistrationIdFromPath(location.pathname);

    expect(registrationId).not.toEqual(null);

    const response = await graphQL.setRegistrationDetailsValidated(registrationId);

    expect(response.data.setRegistrationDetailsValidated).toEqual(true);

    navigation.navigate(`/membership-registration/${registrationId}/overview`);
  });
});
