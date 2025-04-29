import { beforeAll, describe, test, screen, user } from '../../../dist/index.js';
import { GraphQL } from '../../api/graphql.js';
import { RestApi } from '../../api/rest.js';
import { env } from '../../env.js';
import { loginUser } from '../../utils/index.js';
import {
  clickButton,
  createCompanyDetails,
  startPublisherAsOwnerRegistration,
  clickCompanyDataSection,
  clickCompanyDetailsSection,
  fillInCompanyDetails,
} from './helpers.js';

describe('Membership registration publisher', () => {
  let CompanyDetails = {};
  let rsin;
  let graphQL;
  let restApi;

  beforeAll(async () => {
    console.clear();

    CompanyDetails = createCompanyDetails({});
    rsin = '12345678';

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

  describe('Start registration as publisher', () => {
    test('should start a registration', async () => {
      await startPublisherAsOwnerRegistration();
    });
  });

  describe('Bedrijfsgegevens', () => {
    test('should go to Bedrijfsgegevens page', async () => {
      await clickCompanyDataSection();
    });

    test.skip('Volgende button should be disabled', async () => {
      await screen.getByRole('button', { name: 'Volgende', disabled: true });
    });

    test('should open Bedrijfsgegevens card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Bedrijfsgegevens', level: 2 }));

      await screen.isVisible(await screen.getByText('Bedrijfsnaam'));
    });

    test('should go to Bedrijfssgegevens page', async () => {
      await clickCompanyDetailsSection();
    });

    test.only('should fill in company details', async () => {
      await fillInCompanyDetails(CompanyDetails);
    });

    test('should disable Opslaan knop when RSIN is Ja', async () => {
      await user.click(await screen.getByText('Ja'));
      await screen.getByRole('button', { name: 'Opslaan', disabled: true });
    });

    test('should fill in RSIN service number', async () => {
      await user.click(await screen.getByText('Ja'));

      const input = await screen.getBySelector('#rsin');

      await user.type(input, rsin);
    });

    test.skip('should save company details', async () => {
      await clickButton('Opslaan');
    });
  });
});
