import { describe, test, expect, beforeAll, navigation } from '../../../dist/index.js';
import { loginUser } from '../../utils/login-user.js';
import { GraphQL } from '../../api/graphql.js';

import { env } from '../../env.js';
import { getRegistrationIdFromPath } from '../helpers.js';

describe('Set rightsholder approved', () => {
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
  test('should set the registration state to rightsholder approved', async () => {
    const registrationId = getRegistrationIdFromPath(location.pathname);

    expect(registrationId).not.toEqual(null);

    const response = await graphQL.setRightsholderApproved(registrationId);

    expect(response.data.setRightsholderApproved).toEqual(true);

    navigation.navigate(`/membership-registration/${registrationId}/overview`);
  });
});
