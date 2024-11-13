import {
  beforeAll,
  describe,
  test,
  expect,
  screen,
  navigation,
  request,
  user,
  event,
  waitFor,
  page,
} from '../../../dist/index.js';
import { GraphQL } from '../../api/graphql.js';
import { env } from '../../env.js';
import { padNumber } from '../../utils/pad-number.js';
import { loginUser } from '../../utils/login-user.js';
import {
  clickButton,
  clickStartRegistrationAsAuthorCard,
  createPersonalDetails,
  createContactDetails,
  waitForPageload,
  clickOtherIdentificationCard,
  startAuthorAsOwnerRegistration,
  clickPersonalDataSection,
  clickPersonalDetailsSection,
  fillInPersonalDetails,
  fillInPersonalContactDetails,
  fillPersonalPaymentDetailsBankAccount,
  clickIdentificationSection,
} from './helpers.js';

describe('Membership registration', () => {
  let personalDetails = {};
  let contactDetails = {};
  let iBAN;
  let bic;
  let bankName;
  let bankAccountNumber;
  let graphQL;

  beforeAll(async () => {
    console.clear();

    iBAN = 'NL69INGB0123456789';
    bic = 'INGBNL2A';
    bankAccountNumber = '12234';
    bankName = 'Test bank';
    personalDetails = createPersonalDetails();
    contactDetails = createContactDetails();

    await loginUser('backstage');
    await loginUser('non_member');

    graphQL = new GraphQL({
      graphqlEndpoint: env.graphql_endpoint,
      ssoAccessToken: env.users.non_member.sso_access_token,
      ssoAccessTokenBackstage: env.users.backstage.sso_access_token,
    });
  });

  describe('Registratie starten als auteur', () => {
    test('should start a registration', async () => {
      await startAuthorAsOwnerRegistration();
    });

    describe('Registratie starten', async () => {
      test('should not be able to start a new registration', async () => {
        navigation.navigate('/membership-registration');

        await clickStartRegistrationAsAuthorCard();
        await expect(
          request.waitForRequest('/graphql', async (request) => {
            if (!request.body.includes('activeRegistrations')) return false;

            const response = await request.json();

            if (response.errors !== undefined) return false;

            return true;
          }),
        ).resolves.toEqual(true);

        await expect(
          request.waitForRequest('/graphql', async (request) => {
            if (!request.body.includes('startAuthorRegistrationAsOwner')) return false;

            const response = await request.json();

            if (response.errors === undefined) return false;

            return true;
          }),
        ).resolves.toEqual(true);

        await screen.getByText('Je hebt al een registratie gestart. Ga verder met je registratie of breek hem af.');
        await user.click(await screen.getByRole('button', { label: 'Close' }));
        await user.click(await screen.getByText(`Onbekend`));
        await page.location(/overview$/);
        await waitForPageload();
        await screen.getByRole('heading', { name: 'Start je registratie' });
      });
    });
  });

  describe('Registratie annuleren', () => {
    test('should see Registratie annuleren modal', async () => {
      await user.click(await screen.getByRole('button', { name: 'Registratie annuleren' }));
      await screen.getByRole('heading', { name: 'Registratie annuleren' });
    });

    test('should be able to cancel registration', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ga verder' }));
      await page.location(/overview$/);
      await screen.getByRole('heading', { name: 'Word lid van BumaStemra' });
      await waitFor(async () => await expect(await screen.findByText('Lopende registraties:')).toEqual(null));
      await startAuthorAsOwnerRegistration();
    });
  });

  describe('Persoonlijke data', () => {
    test('should click personal data card', async () => {
      await clickPersonalDataSection();
    });

    test('Volgende button should be disabled', async () => {
      await screen.getByRole('button', { name: 'Volgende', disabled: true });
    });

    test('should open Persoonlijke gegevens card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Persoonsgegevens', level: 2 }));

      await screen.isVisible(await screen.getByText('Roepnaam'));
      await screen.isVisible(await screen.getByText('Voornamen'));
      await screen.isVisible(await screen.getByText('Achternaam'));
      await screen.isVisible(await screen.getByText('Geboortedatum'));
      await screen.isVisible(await screen.getByText('Geslacht'));
      await screen.isVisible(await screen.getByText('Geboorteplaats'));
      await screen.isVisible(await screen.getByText('Geboorteland'));
      await screen.isVisible(await screen.getByText('Nationaliteit'));
    });

    test('should open Contactgegevens card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Contactgegevens', level: 2 }));

      await screen.isVisible(await screen.getByText('Postcode'));
      await screen.isVisible(await screen.getByText('Huisnummer'));
      await screen.isVisible(await screen.getByText('Straatnaam'));
      await screen.isVisible(await screen.getByText('Plaats'));
      await screen.isVisible(await screen.getByText('Land'));
      await screen.isVisible(await screen.getByText('Telefoonnummer'));
      await screen.isVisible(await screen.getByText('E-mailadres'));
    });

    test('should open Rekeninggegevens card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Rekeninggegevens', level: 2 }));

      await screen.isVisible(await screen.getByText('Bankrekeningnummer'));
      await screen.isVisible(await screen.getByText('IBAN rekeningnummer'));
      await screen.isVisible(await screen.getByText('Naam bank'));
      await screen.isVisible(await screen.getByText('BIC'));
    });

    test('should go to Persoonsgegevens page', async () => {
      await clickPersonalDetailsSection();
    });

    test('should fill in personal details', async () => {
      await fillInPersonalDetails(personalDetails);
    });

    test('should disable Opslaan knop when taxable Ja', async () => {
      await user.click(await screen.getByText('Ja'));
      await screen.getByRole('button', { name: 'Opslaan', disabled: true });
    });

    test('should save personal details', async () => {
      await user.click(await screen.getByText('Nee'));
      await clickButton('Opslaan');
      await page.location(/\/contact-details$/);
    });

    test('email should be pre filled', async () => {
      const input = await screen.getBySelector('#email');
      await expect(input.value).toBeDefined();
    });

    test('should fill in personal contact details', async () => {
      await fillInPersonalContactDetails(contactDetails);
    });

    test('should save personal details', async () => {
      await clickButton('Opslaan');
      await page.location(/\/account-information$/);
    });

    test('should fill in personal payment details IBAN', async () => {
      const input = await screen.getBySelector('#iban');

      await user.type(input, iBAN);
      await event.blur(input);
      await user.click(await screen.getBySelector('#confirmIban'));
    });

    test('should save personal payment details', async () => {
      await clickButton('Opslaan');
      await page.location(/\/personal-data$/);
    });

    test('should go to payment details', async () => {
      await user.click(await screen.getByRole('button', { name: 'Wijzigen', index: 2 }));
      await page.location(/\/account-information$/);
      await waitForPageload();
    });

    test('should fill in personal payment details Bank account', async () => {
      await fillPersonalPaymentDetailsBankAccount(bankAccountNumber, bankName, bic);
    });

    test('should save personal payment details', async () => {
      await clickButton('Opslaan');
      await page.location(/\/personal-data$/);
      await screen.getByRole('button', { name: 'In behandeling', disabled: true });
    });

    test('should block payment details by backstage', async () => {
      const { data } = await graphQL.membershipActiveRegistrations();
      const [registration] = data.membershipActiveRegistrations;

      const result = await graphQL.blockPersonalPaymentDetails(registration.id);

      expect(result.data).toBeDefined();
    });

    test('should set personal payment details again', async () => {
      navigation.reload('/membership-registration');

      await page.location(/\/personal-data$/);

      await user.click(await screen.getByRole('button', { name: 'Wijzigen', index: 2 }));
      await waitForPageload();
      await fillPersonalPaymentDetailsBankAccount(bankAccountNumber, bankName, bic);
      await clickButton('Opslaan');
      await page.location(/\/personal-data$/);
      await screen.getByRole('button', { name: 'In behandeling', disabled: true });
    });

    test('should approve payment details by backstage', async () => {
      const { data } = await graphQL.membershipActiveRegistrations();
      const [registration] = data.membershipActiveRegistrations;

      const result = await graphQL.approvePersonalPaymentDetails(registration.id);

      expect(result.data).toBeDefined();

      navigation.reload(`/membership-registration/${registration.id}/overview`);

      await page.location(/\/overview$/);

      await screen.getByRole('heading', { level: 1, name: 'Persoonlijke data' });
    });

    test('should go to overview page', async () => {
      await clickButton('Volgende');
      await page.location(/\/overview$/);
      await waitForPageload();
    });

    test('should see Persoonlijke gegevens', async () => {
      await user.click(await screen.getByText('Persoonlijke gegevens'));

      for (const [key, value] of Object.entries(personalDetails)) {
        if (!['sex', 'countryOfBirth', 'nationality'].includes(key)) {
          await screen.getByText(key === 'dateOfBirth' ? value.replace(/\-/g, '/') : value);
        }
      }

      for (const [key, value] of Object.entries(contactDetails)) {
        if (!['country'].includes(key)) {
          await screen.getByText(key === 'telephoneNumber' ? value.replace(/[ +]/g, '') : value);
        }
      }

      await screen.getByText(bic);
      await screen.getByText(bankAccountNumber);
      await screen.getByText(bankName);
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

    describe('Identificeren met iDIN', () => {
      test('should go to Identificeren met iDIN page', async () => {
        await user.click(await screen.getByText('Selecteren'));
        await waitForPageload();
        await screen.getByText('Identificeren met iDIN');
      });

      test('should identify with iDIN', async () => {
        await user.selectOptions(await screen.getByLabel('Bank'), 'INGBNL2A');
        await user.click(await screen.getByRole('button', { name: 'Ga naar iDIN' }));
        await screen.getByText('Bezig met laden...');
      });

      test('should go back to Identificeren page', async () => {
        navigation.go(-1);

        await page.location(/\/identification$/);
      });
    });

    describe('Anders identificeren', () => {
      test('should go to Anders identificeren page', async () => {
        await user.click(await screen.getByText('Wijzigen', 'button'));
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

      test('should decline identification by backstage', async () => {
        const { data } = await graphQL.membershipActiveRegistrations();
        const [registration] = data.membershipActiveRegistrations;

        const result = await graphQL.blockIdentificationByIdentificationDocument(registration.identification.id);

        expect(result.data).toBeDefined();
      });

      test('should see identification blocked', async () => {
        await user.click(await screen.getByText('Terug', 'button'));
        await page.location(/\/overview$/);
        await waitForPageload();
        await user.click(await screen.getByText('Identificeren'));
        await screen.getByText('ID document');
        await screen.getByText('Geblokkeerd');
      });

      test('should be able to identify again', async () => {
        await user.click(await screen.getByText('Invullen', 'button'));
        await page.location(/\/identification$/);
        await user.click(await screen.getByText('Invullen', 'button'));
        await page.location(/\/identification\/form$/);
        await waitForPageload();
        await clickOtherIdentificationCard();
        await user.upload('#copyIdentityCard-input', new File(['Hello'], 'my-file.txt', { type: 'text/plain' }));
        await user.click(await screen.getByText('Verstuur document', 'button'));
        await page.location(/\/identification$/);
        await screen.getByRole('button', { name: 'In behandeling', disabled: true });
      });

      test('should approve identification by backstage', async () => {
        const { data } = await graphQL.membershipActiveRegistrations();
        const [registration] = data.membershipActiveRegistrations;

        const result = await graphQL.approveIdentificationByIdentificationDocument(registration.identification.id);

        expect(result.data).toBeDefined();
      });
    });

    test('should go back to overview page', async () => {
      await user.click(await screen.getByText('Terug', 'button'));
      await page.location(/\/overview$/);
      await waitForPageload();
      await screen.getByRole('button', { name: 'Afgerond', disabled: true });
    });

    test('should see Identificeren details', async () => {
      await screen.getByRole('button', { name: 'Afgerond' });
      await user.click(await screen.getByText('Identificeren'));
      await screen.getByText('ID document');
      await screen.getByText('Goedgekeurd');

      const date = new Date();

      await screen.getByText(`${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${date.getFullYear()}`);
    });
  });

  describe('Rechten beheren', () => {
    test('should go to Rechten beheren', async () => {
      await user.click(await screen.getByText('Invullen', 'button'));

      await page.location(/\/manage-rights$/);
    });

    test('should open Rechten beheren card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Rechten beheren', level: 2 }));
      await screen.isVisible(await screen.getByText('Geselecteerde rechten'));
      await screen.isVisible(await screen.getByText('Dekkingsgebied'));
      await screen.isVisible(await screen.getByText('Startdatum'));
    });

    test('should go to Rechten beheren form', async () => {
      await user.click(await screen.getByText('Invullen', 'button'));
      await page.location(/\/manage-rights\/form$/);
      await waitForPageload();
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
      await waitForPageload();
    });

    test('should see Rechten beheren details', async () => {
      await screen.getByRole('button', { name: 'Afgerond', index: 1 });
      await user.click(await screen.getByText('Rechten beheren'));
      await screen.getByText('Achtergrond muziek');
      await screen.getByText('Events');
      await screen.getByText('Mechanisch');
      await screen.getByText('Online mechanisch');
      await screen.getByText('Online uitvoerend');
      await screen.getByText('RTV en simulcasting');

      const world = await screen.getAllByText('Wereld');

      expect(world.length).toEqual(6);
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
      await waitForPageload();
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await page.location(/overview$/);
      await waitForPageload();
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
      await waitForPageload();
      await screen.getByRole('button', { name: 'Registratie annuleren' });
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await page.location(/sign-contract$/);
    });

    test('should sign contract Stemra', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen', index: 1 }));
      await waitForPageload();
    });

    test('should go to Registratie succesvol', async () => {
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await page.location(/completed$/);
      await screen.getByRole('heading', { name: 'Registratie succesvol' });
    });
  });
});
