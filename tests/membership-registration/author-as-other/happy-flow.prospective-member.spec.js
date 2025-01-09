import { beforeAll, describe, test, screen, user, page } from '../../../dist/index.js';
import { GraphQL } from '../../api/graphql.js';
import { RestApi } from '../../api/rest.js';
import { env } from '../../env.js';
import { loginUser } from '../../utils/login-user.js';
import { startAuthorAsManagerRegistration } from './helpers.js';
import { waitForPageload } from '../helpers.js';

describe('Membership registration author as other', () => {
  let restApi;
  let graphQL;

  beforeAll(async () => {
    console.clear();

    const { 'sso-access-token': ssoAccessToken } = getCookie('sso-access-token');

    await loginUser('backstage');
    await loginUser('debug');

    restApi = new RestApi({
      restEndpoint: env.rest_endpoint,
      ssoAccessToken,
      ssoAccessTokenBackstage: env.users.backstage.sso_access_token,
      ssoAccessTokenDebug: env.users.debug.sso_access_token,
    });

    graphQL = new GraphQL({
      graphqlEndpoint: env.graphql_endpoint,
      ssoAccessToken,
      ssoAccessTokenBackstage: env.users.backstage.sso_access_token,
      ssoAccessTokenDebug: env.users.debug.sso_access_token,
    });
  });

  describe('Registratie starten als auteur', () => {
    test('should start a registration', async () => {
      await startAuthorAsManagerRegistration();
    });
  });

  describe('Contract ondertekenen', () => {
    test('should not be started', async () => {
      await user.click(await screen.getByText('Contract ondertekenen'));
      await screen.getByText('Nog niet gestart');
    });

    test.only('should go to Contract tekenen', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await page.location(/\/sign-contract/);
      await waitForPageload();
    });

    test.skip('should sign contract Buma', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await waitForPageload();
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await page.location(/overview$/);
      await waitForPageload();
    });

    test.skip('should see Contract tekenen details', async () => {
      await screen.getByRole('button', { name: 'Ondertekenen' });
      await user.click(await screen.getByText('Contract ondertekenen'));
      await screen.getByText('Buma');
      await screen.getByText('Ondertekend');
    });

    test.skip('should see that the Buma contract is signed', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await page.location(/sign-contract$/);
      await screen.getByRole('button', { name: 'Ondertekenen', disabled: true });
    });

    test.skip('should show registration cancel button', async () => {
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await waitForPageload();
      await screen.getByRole('button', { name: 'Registratie annuleren' });
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await page.location(/sign-contract$/);
    });

    test.skip('should sign contract Stemra', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen', index: 1 }));
      await waitForPageload();
    });

    test.skip('should go to Registratie succesvol', async () => {
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await page.location(/completed$/);
      await screen.getByRole('heading', { name: 'Registratie succesvol' });
    });

    test.skip('should process ip basenumber added event ', async () => {
      // const result = await graphQL.membershipActiveRegistrations();
      // await restApi.memberRelationIPIBaseNumberWasAdded(
      //   {
      //     personalDetails: { ...personalDetails, citizenServiceNumber },
      //     personalContactDetails: contactDetails,
      //     personalPaymentDetails: {
      //       bankAccountNumber,
      //       bic,
      //       bankName,
      //       iBAN,
      //     },
      //   },
      //   result.data.membershipActiveRegistrations[0].rightsholder.ipBaseNumber,
      // );
    });
  });
});
