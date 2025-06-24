import { beforeAll, describe, expect, event, test, screen, user, page, navigation } from '@e2e/index.js';
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
import { getRegistrationIdFromPath } from '../helpers.js';

describe('Membership registration publisher', () => {
  let companyDetails: Record<string, any> = {};
  let contactDetails: Record<string, any> = {};
  let graphQL: GraphQL;
  let restApi: RestApi;
  let iBAN: string;
  let bankAccountNumber: string;
  let bankName: string;
  let bic: string;
  let signerOneEmail: string;
  let signerTwoEmail: string;

  beforeAll(async () => {
    console.clear();

    companyDetails = createCompanyDetails({
      name: 'Music Company BV',
      chamberOfCommerceNumber: '123456789',
      dateOfIncorporation: '01-01-2020',
      zipCode: '1234 AB',
      city: 'Spaarnwoude',
      street: 'Dennestraat',
      houseNumber: '1',
      houseNumberAddition: '',
      signers: [
        {
          firstName: 'Jane',
          firstNames: 'Jane',
          lastName: 'Doe',
          infix: '',
          dateOfBirth: '01-01-1980',
          email: env.users.signer_one.login_id,
        },
        {
          firstName: 'John',
          firstNames: 'John',
          lastName: 'Doe',
          infix: '',
          dateOfBirth: '01-01-1980',
          email: env.users.signer_two.login_id,
        },
      ],
    });
    contactDetails = createContactDetails();
    iBAN = 'NL69INGB0123456789';
    bankAccountNumber = '12234';
    bankName = 'ing';
    bic = 'INGBNL2A';
    signerOneEmail = env.users.signer_one.login_id;
    signerTwoEmail = env.users.signer_two.login_id;

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
    });

    test('Volgende button should be disabled', async () => {
      await screen.getByRole('button', { name: 'Volgende', disabled: true });
    });

    test('should open Bedrijfsgegevens card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Bedrijfsgegevens', level: 2 }));

      await screen.isVisible(await screen.getByText<HTMLElement>('Bedrijfsnaam'));
    });

    describe('company details', () => {
      test('should go to Bedrijfssgegevens page', async () => {
        await clickCompanyDetailsSection();
      });

      describe('manual input', () => {
        test('should upload proof of registration', async () => {
          await user.upload(
            '#proofOfRegistration-input',
            new File(['Hello'], 'my-file.pdf', { type: 'application/pdf' }),
          );
        });

        test('should fill in company details manually', async () => {
          await fillInCompanyDetails(companyDetails);
        });

        test('should see sbi error message', async () => {
          await screen.getBySelector('#sbi-helper-text');
        });

        test('should fill in correct sbi', async () => {
          companyDetails.sbi = '5920';

          await user.type('#sbi', companyDetails.sbi);
        });

        test('should add signer with wrong details', async () => {
          const [signer] = companyDetails.signers;

          await user.type('#firstName', 'Wrong');
          await user.type('#firstNames', 'Wrong Name');
          await user.type('#infix', signer.infix);
          await user.type('#lastName', signer.lastName);
          await pickDate(await screen.getBySelector('#dateOfBirth'), signer.dateOfBirth);
          const emailInput = await screen.getBySelector<HTMLInputElement>('#email');
          await user.type(emailInput, signer.email);
          await user.click(await screen.getByRole('button', { name: 'Toevoegen' }));
        });

        test('should see owner required message', async () => {
          await user.click(await screen.getByText('Selecteer ten minste één ondertekenaar als eigenaar'));
        });

        test('should edit signer', async () => {
          await user.click(await screen.getBySelector('button[title="edit"]', { index: 0 }));

          const [signer] = companyDetails.signers;

          await user.type(
            await screen.getBySelector<HTMLInputElement>('[name="firstName"]', { index: 1 }),
            signer.firstName,
          );
          await user.type(
            await screen.getBySelector<HTMLInputElement>('[name="firstNames"]', { index: 1 }),
            signer.firstNames,
          );
          await user.click(await screen.getByRole('button', { name: 'Opslaan' }));
        });

        test('should delete signer', async () => {
          await user.click(await screen.getBySelector('button[title="delete"]', { index: 0 }));
        });

        test('should see signer required message', async () => {
          await user.click(await screen.getByText('Ondertekenaar is verplicht'));
        });

        test('should add signer', async () => {
          const [signer] = companyDetails.signers;

          await user.type('#firstName', signer.firstName);
          await user.type('#firstNames', signer.firstNames);
          await user.type('#infix', signer.infix);
          await user.type('#lastName', signer.lastName);
          await pickDate(await screen.getBySelector('#dateOfBirth'), signer.dateOfBirth);
          const emailInput = await screen.getBySelector<HTMLInputElement>('#email');
          await user.type(emailInput, signer.email);
          await user.click(await screen.getByRole('button', { name: 'Toevoegen' }));
        });

        test('should set signer as owner', async () => {
          await user.click(await screen.getBySelector('input[name="owner"]', { index: 0 }));
        });
      });

      test('should show RSIN input when RSIN is Ja', async () => {
        await user.click(await screen.getByText('Ja'));
        await screen.getBySelector('#rsin');
      });

      test('should fill in RSIN service number', async () => {
        await user.click(await screen.getByText('Ja'));

        const input = await screen.getBySelector<HTMLInputElement>('#rsin');

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

        const inputBankAccountNumber = await screen.getBySelector<HTMLInputElement>('#bankAccountNumber');
        const inputBankName = await screen.getBySelector<HTMLInputElement>('#bankName');
        const inputBic = await screen.getBySelector<HTMLInputElement>('#bic');

        await user.type(inputBankAccountNumber, bankAccountNumber);
        await user.type(inputBankName, bankName);
        await user.type(inputBic, bic);
        await user.upload('#bankStatement-input', new File(['Hello'], 'my-file.png', { type: 'image/png' }));
      });

      test('should fill in IBAN', async () => {
        await user.click(await screen.getByText('IBAN rekeningnummer'));

        const input = await screen.getBySelector<HTMLInputElement>('#iban');
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
        await user.selectOptions('#country', contactDetails.country);
      });

      test('should save contact details', async () => {
        await clickButton('Opslaan');
      });

      test('should go back to company data overview page', async () => {
        await page.location(/\/company-data$/);
      });
    });

    test('should see Bedrijfsgegevens', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Bedrijfsgegevens', level: 2 }));

      for (const [key, value] of Object.entries(companyDetails)) {
        let v = value;

        if (key === 'dateOfIncorporation') v = value.split('-').map(padNumber).join('/');

        if (key === 'zipcode') v = value.replace(/(\d{4})(\w{2})/, '$1 $2');

        if (v) await screen.getByText(v);
      }
    });

    test('should see Rekeninggegevens', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Rekeninggegevens', level: 2 }));
      await screen.getByText(iBAN);
    });

    test('should see Contactgegevens', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Contactgegevens', level: 2 }));
    });

    test('should go to Start je registratie page', async () => {
      await clickButton('Volgende');

      await page.location(/\/overview$/);

      navigation.reload(`/membership-registration`);
    });

    test('should see identification button pending', async () => {
      await screen.getByRole('button', { name: 'In behandeling', disabled: true, index: 0 });
    });
  });

  describe('Rechten beheren', () => {
    test('should go to Rechten beheren', async () => {
      if (await screen.findByRole('button', { name: 'Invullen', disabled: true, index: 1 })) {
        const registrationId = getRegistrationIdFromPath(location.pathname);

        await graphQL.setRightsholderAsNew(registrationId);

        navigation.reload(`/membership-registration`);
      }

      await user.click(await screen.getByRole<HTMLButtonElement>('button', { name: 'Invullen', disabled: false }));
      await page.location(/\/manage-rights$/);
    });

    test('should open Rechten beheren card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Rechten beheren', level: 2 }));
      await screen.isVisible(await screen.getByText<HTMLElement>('Geselecteerde rechten'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Dekkingsgebied'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Startdatum'));
    });

    test('should go to Rechten beheren form', async () => {
      await user.click(await screen.getByText('Invullen', 'button'));

      await page.location(/\/manage-rights\/form$/);
    });

    test('should save selected rights', async () => {
      await clickButton('Opslaan');
      await page.location(/\/manage-rights$/);
    });

    test('should confirm details', async () => {
      await clickButton('Volgende');
      await screen.getByText('Bevestig je gegevens');
      await clickButton('Ga verder');

      await page.location(/\/overview$/);
    });

    test('should see Rechten beheren details', async () => {
      await screen.getByRole('button', { name: 'Afgerond', index: 1 });
      await user.click(await screen.getByText('Rechten beheren'));
      await screen.getByText('Achtergrond muziek');
      await screen.getByText('Events');
      await screen.getByText('Mechanisch');
      await screen.getByText('Online mechanisch');
      await screen.getByText('Online uitvoerend');
      await screen.getByText('Radio, Televisie en Simulcasting');

      const world = await screen.getAllByText('Wereld');

      expect(world.length).toEqual(6);
    });
  });
});
