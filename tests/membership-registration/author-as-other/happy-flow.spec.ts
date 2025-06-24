import {
  beforeAll,
  describe,
  test,
  expect,
  screen,
  user,
  event,
  page,
  navigation,
  wait,
  getCookie,
  setCookie,
} from '@e2e/index.js';
import { GraphQL } from '../../api/graphql.js';
import { RestApi } from '../../api/rest.js';
import { env } from '../../env.js';
import { padNumber, loginUser } from '../../utils/index.js';
import {
  clickButton,
  createPersonalDetails,
  createContactDetails,
  clickPersonalDataSection,
  clickPersonalDetailsSection,
  fillInPersonalDetails,
  fillInPersonalContactDetails,
  clickIdentificationSection,
  clickOtherIdentificationCard,
} from '../author-as-owner/helpers.js';
import { startAuthorAsOtherRegistration } from './helpers.js';
import { getRegistrationIdFromPath } from '../helpers.js';

describe('Membership registration author as other', () => {
  let personalDetails: Record<string, any> = {};
  let contactDetails: Record<string, any> = {};
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
    personalDetails = createPersonalDetails({
      firstName: 'Sponge Bob',
      firstNames: 'Sponge Bob',
      lastName: 'Square Pants',
      dateOfBirth: '18-11-1950',
    });
    contactDetails = createContactDetails({ email: env.users.new_member.login_id });

    const { 'sso-access-token': ssoAccessToken } = getCookie('sso-access-token');

    await loginUser('backstage');
    await loginUser('debug');

    graphQL = new GraphQL({
      graphqlEndpoint: env.graphql_endpoint,
      ssoAccessToken,
      ssoAccessTokenBackstage: env.users.backstage.sso_access_token,
      ssoAccessTokenDebug: env.users.debug.sso_access_token,
    });

    restApi = new RestApi({
      restEndpoint: env.rest_endpoint,
      ssoAccessToken,
      ssoAccessTokenBackstage: env.users.backstage.sso_access_token,
      ssoAccessTokenDebug: env.users.debug.sso_access_token,
    });
  });

  describe('Registratie starten als auteur', () => {
    test('should start a registration', async () => {
      await startAuthorAsOtherRegistration();
    });
  });

  describe('Persoonlijke data', () => {
    test('should go to Persoonlijke gegevens page', async () => {
      await clickPersonalDataSection();
    });

    test('Volgende button should be disabled', async () => {
      await screen.getByRole('button', { name: 'Volgende', disabled: true });
    });

    test('should open Persoonlijke gegevens card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Persoonsgegevens', level: 2 }));

      await screen.isVisible(await screen.getByText<HTMLElement>('Roepnaam'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Voornamen'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Achternaam'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Geboortedatum'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Geslacht'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Geboorteplaats'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Geboorteland'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Nationaliteit'));
    });

    test('should open Contactgegevens card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Contactgegevens', level: 2 }));

      await screen.isVisible(await screen.getByText<HTMLElement>('Postcode'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Huisnummer'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Straatnaam'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Plaats'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Land'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Telefoonnummer'));
      await screen.isVisible(await screen.getByText<HTMLElement>('E-mailadres'));
    });

    test('should open Rekeninggegevens card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Rekeninggegevens', level: 2 }));

      await screen.isVisible(await screen.getByText<HTMLElement>('Bankrekeningnummer'));
      await screen.isVisible(await screen.getByText<HTMLElement>('IBAN rekeningnummer'));
      await screen.isVisible(await screen.getByText<HTMLElement>('Naam bank'));
      await screen.isVisible(await screen.getByText<HTMLElement>('BIC'));
    });

    test('should go to Persoonsgegevens page', async () => {
      await clickPersonalDetailsSection();
    });

    test('firstName should not be pre filled', async () => {
      const input = await screen.getBySelector<HTMLInputElement>('#firstName');

      expect(input.value).toEqual('');
    });

    test('firstNames should not be pre filled', async () => {
      const input = await screen.getBySelector<HTMLInputElement>('#firstNames');

      expect(input.value).toEqual('');
    });

    test('lastName should not be pre filled', async () => {
      const input = await screen.getBySelector<HTMLInputElement>('#lastName');

      expect(input.value).toEqual('');
    });

    test('should fill in personal details', async () => {
      await fillInPersonalDetails(personalDetails);
    });

    test('should disable Opslaan knop when taxable Ja', async () => {
      await user.click(await screen.getByText('Ja'));
      await screen.getByRole('button', { name: 'Opslaan', disabled: true });
    });

    test('should fill in citizen service number', async () => {
      await user.click(await screen.getByText('Ja'));

      const input = await screen.getBySelector<HTMLInputElement>('#citizenServiceNumber');

      await user.type(input, citizenServiceNumber);
      await user.click(await screen.getByText('Ja'));
    });

    test('should save personal details', async () => {
      await clickButton('Opslaan');
    });

    test('should go to Contact gegevens page', async () => {
      await page.location(/\/contact-details$/);
    });

    test('email should not be pre filled', async () => {
      const input = await screen.getBySelector<HTMLInputElement>('#email');

      expect(input.value).toEqual('');
    });

    test('should fill in personal contact details', async () => {
      await fillInPersonalContactDetails(contactDetails);
    });

    test('should save personal details', async () => {
      await clickButton('Opslaan');
    });

    test('should go to Rekeninggegevens page', async () => {
      await page.location(/\/account-information$/);
    });

    test('should fill in personal payment details IBAN', async () => {
      const input = await screen.getBySelector<HTMLInputElement>('#iban');
      const checkbox = await screen.getBySelector('#confirmIban');

      await user.type(input, iBAN);
      await event.blur(input);
      await user.click(checkbox);
      await event.blur(checkbox);
    });

    test('should save personal payment details', async () => {
      await clickButton('Opslaan');
    });

    test('should go to Persoonlijke data page', async () => {
      await page.location(/\/personal-data$/);
    });

    test('should go to Start je registratie page', async () => {
      await clickButton('Volgende');
      await page.location(/\/overview$/);
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

      await screen.getByText(iBAN);
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

    test('Identificeren met iDIN should should not be visible', async () => {
      await expect(screen.findByRole('heading', { level: 3, name: 'Identificeren met iDIN' })).resolves.toEqual(null);
    });

    describe('Anders identificeren', () => {
      test('should go to Anders identificeren page', async () => {
        await clickOtherIdentificationCard(0);
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
      if (await screen.findByRole('button', { name: 'Geblokkeerd' })) {
        const registrationId = getRegistrationIdFromPath(location.pathname);

        await graphQL.setRightsholderAsNew(registrationId);

        navigation.reload(`/membership-registration`);
      }

      await user.click(await screen.getByText('Invullen', 'button'));
      await page.location(/\/manage-rights$/);
    });

    test('should open Rechten beheren card', async () => {
      await user.click(await screen.getByRole('heading', { name: 'Rechten beheren', level: 2 }));
      await screen.isVisible(await screen.getByText<HTMLInputElement>('Geselecteerde rechten'));
      await screen.isVisible(await screen.getByText<HTMLInputElement>('Dekkingsgebied'));
      await screen.isVisible(await screen.getByText<HTMLInputElement>('Startdatum'));
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

  describe('Contract ondertekenen', () => {
    test('should not be started', async () => {
      await user.click(await screen.getByText('Contract ondertekenen'));
      await screen.getByText('Nog niet gestart');
    });

    test.skip('should go to Contract tekenen', async () => {
      const date = new Date();

      date.setFullYear(date.getFullYear() + 1);

      const attributes = { expires: date.toUTCString(), secure: true, path: '/', domain: 'localhost' };

      setCookie(
        {
          key: 'sso-access-token',
          value: env.users.non_member.sso_access_token,
          attributes,
        },
        {
          key: 'refresh-token',
          value: env.users.non_member.refresh_token,
          attributes,
        },
        {
          key: 'x-profile-id',
          value: null,
          attributes,
        },
      );

      const registrationId = getRegistrationIdFromPath(location.pathname);

      expect(registrationId).not.toEqual(null);

      navigation.reload('/membership-registration');

      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await page.location(/\/sign-contract/);
    });

    test.skip('should sign contract Buma', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await page.location(/overview$/);
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
      await screen.getByRole('button', { name: 'Registratie annuleren' });
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen' }));
      await page.location(/sign-contract$/);
    });

    test.skip('should sign contract Stemra', async () => {
      await user.click(await screen.getByRole('button', { name: 'Ondertekenen', index: 1 }));
    });

    test.skip('should go to Registratie succesvol', async () => {
      await user.click(await screen.getByRole('button', { name: 'Terug' }));
      await page.location(/completed$/);
      await screen.getByRole('heading', { name: 'Registratie succesvol' });
    });

    test.skip('should process ip basenumber added event ', async () => {
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
