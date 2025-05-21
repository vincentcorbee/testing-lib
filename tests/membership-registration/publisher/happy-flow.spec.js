import { beforeAll, describe, test, screen, user, wait, keyboard, event, page, request } from '../../../dist/index.js';
import { GraphQL } from '../../api/graphql.js';
import { RestApi } from '../../api/rest.js';
import { env } from '../../env.js';
import { loginUser, padNumber, pickDate } from '../../utils/index.js';
import {
  clickButton,
  createCompanyDetails,
  createContactDetails,
  startPublisherAsOwnerRegistration,
  clickCompanyDataSection,
  clickCompanyDetailsSection,
  fillInCompanyDetails,
} from './helpers.js';

describe('Membership registration publisher', () => {
  let companyDetails = {};
  let contactDetails = {};
  let graphQL;
  let restApi;
  let iBAN;
  let bankAccountNumber;
  let bankName;
  let bic;

  beforeAll(async () => {
    console.clear();

    companyDetails = createCompanyDetails({
      name: 'Universal International Music',
      chamberOfCommerceNumber: '31018439',
    });
    contactDetails = createContactDetails();
    iBAN = 'NL69INGB0123456789';
    bankAccountNumber = '12234';
    bankName = 'ing';
    bic = 'INGBNL2A';

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

    test('should see the different sections', async () => {
      await screen.getByRole('heading', { name: 'Bedrijfsgegevens', level: 2 });
      await screen.getByRole('heading', { name: 'Rekeninggegevens', level: 2 });
      await screen.getByRole('heading', { name: 'Contactgegevens', level: 2 });
      await screen.getByRole('heading', { name: 'Ondertekenaars', level: 2 });
    });

    test('Volgende button should be disabled', async () => {
      await screen.getByRole('button', { name: 'Volgende', disabled: true });
    });

    test('should open Bedrijfsgegevens card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Bedrijfsgegevens', level: 2 }));

      await screen.isVisible(await screen.getByText('Bedrijfsnaam'));
    });

    describe('company details', () => {
      test('should go to Bedrijfssgegevens page', async () => {
        await clickCompanyDetailsSection();
      });

      test('should search company info', async () => {
        const input = await screen.getBySelector('#company-info-search-field');

        await user.type(input, companyDetails.name);
        await wait(2000);
        await keyboard.press('ArrowDown', { target: input });
        await keyboard.press('Enter', { target: input });
        await request.waitForRequest('/graphql', async (request) => {
          const {
            data: { companyInfoDetails },
          } = JSON.parse(await request.response.text());

          companyDetails.name = companyInfoDetails.tradeNameFull;
          companyDetails.chamberOfCommerceNumber = companyInfoDetails.dossierNumber;
          companyDetails.dateOfIncorporation = companyInfoDetails.foundingDate;
          companyDetails.legalForm = companyInfoDetails.legalFormCode;
          companyDetails.zipcode = companyInfoDetails.postcode;
          companyDetails.houseNumber = companyInfoDetails.houseNumber.toString();
          companyDetails.houseNumberAddition = companyInfoDetails.houseNumberAddition;
          companyDetails.street = companyInfoDetails.street;
          companyDetails.city = companyInfoDetails.city;
          companyDetails.country = 'NL';
          companyDetails.vatNumber = companyInfoDetails.vatNumber;
          companyDetails.rsin = companyInfoDetails.rsinNumber;
        });
        await wait(2000);
      });

      test('should fill in company details', async () => {
        await fillInCompanyDetails(companyDetails);
      });

      test('should show RSIN input when RSIN is Ja', async () => {
        await user.click(await screen.getByText('Ja'));
        await screen.getBySelector('#rsin');
      });

      test('should fill in RSIN service number', async () => {
        await user.click(await screen.getByText('Ja'));

        const input = await screen.getBySelector('#rsin');

        await user.type(input, companyDetails.rsin);
      });

      test('should save company details', async () => {
        await clickButton('Opslaan');
      });

      test('should go to Rekeninggegevens page', async () => {
        await page.location(/\/account-details$/);
      });
    });

    describe('account details', () => {
      test('should fill in bank account', async () => {
        await user.click(await screen.getByText('Ik heb geen IBAN rekeningnummer'));

        const inputBankAccountNumber = await screen.getBySelector('#bankAccountNumber');
        const inputBankName = await screen.getBySelector('#bankName');
        const inputBic = await screen.getBySelector('#bic');

        await user.type(inputBankAccountNumber, bankAccountNumber);
        await user.type(inputBankName, bankName);
        await user.type(inputBic, bic);
        await user.upload('#bankStatement-input', new File(['Hello'], 'my-file.png', { type: 'image/png' }));
      });

      test('should fill in IBAN', async () => {
        await user.click(await screen.getByText('IBAN rekeningnummer'));

        const input = await screen.getBySelector('#iban');
        const checkbox = await screen.getBySelector('#ibanConfirmed');

        await user.type(input, iBAN);
        await event.blur(input);
        await user.click(checkbox);
        await event.blur(checkbox);
      });

      test('should save account details', async () => {
        await clickButton('Opslaan');
      });

      test('should go to Contactgegevens page', async () => {
        await page.location(/\/contact-details$/);
      });
    });

    describe('contact details', () => {
      test('should fill contact details', async () => {
        await user.selectOptions('#sex', contactDetails.sex);
        await user.type('#firstName', contactDetails.firstName);
        await user.type('#infix', contactDetails.infix);
        await user.type('#lastName', contactDetails.lastName);
        await user.type('input[name=telephoneNumber]', contactDetails.telephoneNumber);
        await user.type('#email', contactDetails.email);
        await pickDate(await screen.getBySelector('#dateOfBirth'), contactDetails.dateOfBirth);
      });

      test('should save contact details', async () => {
        await clickButton('Opslaan');
      });

      test('should go to Ondertekenaars page', async () => {
        await page.location(/\/signers$/);
      });
    });

    describe('signers', () => {
      test('should go to Bedrijfsgegevens page', async () => {
        await page.location(/\/company-data$/);
      });
    });

    test('should see Bedrijfsgegevens', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Bedrijfsgegevens', level: 2 }));

      for (const [key, value] of Object.entries(companyDetails)) {
        let v = value;

        if (key === 'dateOfIncorporation') v = value.split('-').map(padNumber).join('/');

        if (key === 'zipcode') v = value.replace(/(\d{4})(\w{2})/, '$1 $2');

        await screen.getByText(v);
      }
    });

    test('should see Rekeninggegevens', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Rekeninggegevens', level: 2 }));
      await screen.getByText(iBAN);
    });
  });
});
