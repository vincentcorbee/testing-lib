import { beforeAll, describe, test, expect, screen, user, page, wait } from '@e2e/index.js';
import { GraphQL } from '../../api/graphql.js';
import { env } from '../../env.js';
import { padNumber, loginUser } from '../../utils/index.js';
import { clickIdentificationSection, clickOtherIdentificationCard } from './helpers.js';
import { getRegistrationIdFromPath } from '../helpers.js';

describe('Membership registration', () => {
  let graphQL;

  beforeAll(async () => {
    console.clear();

    await loginUser('backstage');
    await loginUser('signer_one');
    await loginUser('debug');

    graphQL = new GraphQL({
      graphqlEndpoint: env.graphql_endpoint,
      ssoAccessToken: env.users.signer_one.sso_access_token,
      ssoAccessTokenBackstage: env.users.backstage.sso_access_token,
      ssoAccessTokenDebug: env.users.debug.sso_access_token,
    });
  });

  describe('Identificeren', () => {
    test('should go to identification overview page', async () => {
      await clickIdentificationSection();
      await page.location(/\/identification$/);
    });

    test('should go to identification form page', async () => {
      await user.click(await screen.getByText('Invullen', 'button'));
      await page.location(/\/identification\/form$/);
    });

    describe('Anders identificeren', () => {
      test('should go to Anders identificeren page', async () => {
        await clickOtherIdentificationCard();
      });

      test('should upload identification', async () => {
        await user.upload('#copyIdentityCard-input', new File(['Hello'], 'my-file.txt', { type: 'text/plain' }));
      });

      test('should send identification', async () => {
        await user.click(await screen.getByText('Verstuur document', 'button'));
        await page.location(/\/identification$/);
        await screen.getByRole('button', { name: 'In behandeling', disabled: true });
      });

      test('should approve identification by backstage', async () => {
        const registrationId = getRegistrationIdFromPath(location.pathname);
        const {
          data: {
            membershipRegistrationById: { identification },
          },
        } = await graphQL.getRegistration(registrationId);
        const result = await graphQL.approveIdentificationByIdentificationDocument(identification.id);

        await wait(3000);

        expect(result).toBeDefined();
      });
    });

    test('should go back to overview page', async () => {
      await user.click(await screen.getByText('Terug', 'button'));
      await page.location(/\/overview$/);
    });

    test.only('should see Identificeren details', async () => {
      await screen.getByRole('button', { name: 'Afgerond', disabled: true });
      await user.click(await screen.getByText('Identificeren'));
      await screen.getByText('ID document');
      await screen.getByText('Goedgekeurd');

      const date = new Date();

      await screen.getByText(`${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${date.getFullYear()}`);
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
    });

    test('should select language contract Buma', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ga verder' }));
    });

    test('should go back to overview', async () => {
      await wait(3000);
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

    test('should select language contract Stemra', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ga verder' }));
    });

    test('should go back to overview', async () => {
      await wait(3000);
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await page.location(/overview$/);
    });
  });
});
