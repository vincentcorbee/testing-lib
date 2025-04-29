import { beforeAll, describe, test, screen, user, page } from '../../../../dist/index.js';
import { GraphQL } from '../../../api/graphql.js';
import { RestApi } from '../../../api/rest.js';
import { env } from '../../../env.js';
import { loginUser } from '../../../utils/index.js';
import { createPersonalDetails, createContactDetails } from '../helpers.js';

describe('Membership registration', () => {
  let personalDetails = {};
  let contactDetails = {};
  let iBAN;
  let citizenServiceNumber;
  let bankName;
  let bankAccountNumber;
  let graphQL;
  let restApi;

  beforeAll(async () => {
    console.clear();

    iBAN = 'NL69INGB0123456789';
    citizenServiceNumber = '111222333';
    bankAccountNumber = '12234';
    bankName = 'Test bank';
    personalDetails = createPersonalDetails({
      firstName: 'Sponge Bob',
      firstNames: 'Sponge Bob',
      lastName: 'Square Pants',
      dateOfBirth: '18-11-2020',
    });
    contactDetails = createContactDetails({ email: env.users.non_member.login_id });

    await loginUser('backstage');
    await loginUser('non_member');
    await loginUser('debug');

    graphQL = new GraphQL({
      graphqlEndpoint: env.graphql_endpoint,
      ssoAccessToken: env.users.non_member.sso_access_token,
      ssoAccessTokenBackstage: env.users.backstage.sso_access_token,
      ssoAccessTokenDebug: env.users.debug.sso_access_token,
    });

    restApi = new RestApi({
      restEndpoint: env.rest_endpoint,
      ssoAccessToken: env.users.non_member.sso_access_token,
      ssoAccessTokenBackstage: env.users.backstage.sso_access_token,
      ssoAccessTokenDebug: env.users.debug.sso_access_token,
    });
  });

  describe('Contract ondertekenen', () => {
    test('should not be started', async () => {
      await user.click(await screen.getByText('Contract ondertekenen'));
      await screen.getByText('Nog niet gestart');
    });

    test('should go to Contract tekenen', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await page.location(/\/sign-contract/);
    });

    test('should sign contract Buma', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await page.location(/overview$/);
    });

    test('should see Contract tekenen details', async () => {
      await screen.getByRole('button', { name: 'Ondertekenen' });
      await user.click(await screen.getByText('Contract ondertekenen'));
      await screen.getByText('Buma');
      await screen.getByText('Ondertekend');
    });

    test('should see that the Buma contract is signed', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await page.location(/sign-contract$/);
      await screen.getByRole('button', { name: 'Ondertekenen', disabled: true });
    });

    test('should show registration cancel button', async () => {
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await screen.getByRole('button', { name: 'Registratie annuleren' });
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await page.location(/sign-contract$/);
    });

    test('should sign contract Stemra', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen', index: 1 }));
    });

    test('should go to Registratie succesvol', async () => {
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await page.location(/completed$/);
      await screen.getByRole('heading', { name: 'Registratie succesvol' });
    });

    test('should process ip basenumber added event ', async () => {
      const result = await graphQL.membershipActiveRegistrations();

      await restApi.memberRelationIPIBaseNumberWasAdded(
        {
          personalDetails: { ...personalDetails, citizenServiceNumber },
          personalContactDetails: contactDetails,
          personalPaymentDetails: {
            bankAccountNumber,
            bankName,
            iBAN,
          },
        },
        result.data.membershipActiveRegistrations[0].rightsholder.ipBaseNumber,
      );
    });
  });
});
