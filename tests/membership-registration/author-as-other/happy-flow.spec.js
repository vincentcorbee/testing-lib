import { beforeAll, describe, test, expect, screen, user, event, page, navigation } from '../../../dist/index.js';
import { GraphQL } from '../../api/graphql.js';
import { RestApi } from '../../api/rest.js';
import { env } from '../../env.js';
import { padNumber } from '../../utils/pad-number.js';
import { loginUser } from '../../utils/login-user.js';
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
import { startAuthorAsManagerRegistration } from './helpers.js';
import { waitForPageload, getRegistrationIdFromPath } from '../helpers.js';

/* Set Cookie: https://datatracker.ietf.org/doc/html/rfc6265 */

const MAX_AGE_ATTRIBUTE = 'Max-Age';
const EXPIRES_ATTRIBUTE = 'Expires';
const DOMAIN_ATTRIBUTE = 'Domain';
const PATH_ATTRIBUTE = 'Path';
const SECURE_ATTRIBUTE = 'Secure';
const HTTP_ONLY_ATTRIBUTE = 'HttpOnly';

const KEY_VALUE_SEPARATOR = '=';
const ATTRIBUTE_DELIMITER = ';';
const WHITE_SPACE = ' ';

const AttributesMap = new Map([
  [EXPIRES_ATTRIBUTE.toLowerCase(), EXPIRES_ATTRIBUTE],
  [MAX_AGE_ATTRIBUTE.toLowerCase(), MAX_AGE_ATTRIBUTE],
  [DOMAIN_ATTRIBUTE.toLowerCase(), DOMAIN_ATTRIBUTE],
  [PATH_ATTRIBUTE.toLowerCase(), PATH_ATTRIBUTE],
  [SECURE_ATTRIBUTE.toLowerCase(), SECURE_ATTRIBUTE],
  [HTTP_ONLY_ATTRIBUTE.toLocaleLowerCase(), HTTP_ONLY_ATTRIBUTE],
]);

const BooleanAttributes = new Set([SECURE_ATTRIBUTE, HTTP_ONLY_ATTRIBUTE]);

function getAttributeValue(attributeName, value) {
  switch (attributeName) {
    case EXPIRES_ATTRIBUTE:
      return value instanceof Date ? value.toUTCString() : new Date(value).toUTCString();
    default:
      return encodeURIComponent(value);
  }
}

function createCookie(key, value = '') {
  return `${key}${KEY_VALUE_SEPARATOR}${value}`;
}

function getCookie(...cookieNames) {
  const cookies = {};

  /*
    document.cookie returns a list of key value pairs seperated by a semi colon.
    It wil not return the attributes of the cookie. So the semi colon is not used to signify cookie attributes.
  */
  document.cookie.split(ATTRIBUTE_DELIMITER).forEach((cookie) => {
    if (cookie.includes(KEY_VALUE_SEPARATOR)) {
      const [key, value] = cookie.split(KEY_VALUE_SEPARATOR);

      cookies[key.trim()] = decodeURIComponent(value.trim());
    }
  });

  if (cookieNames.length === 0) return cookies;

  const result = {};

  for (const name of cookieNames) result[name] = cookies[name];

  return result;
}

function createCookieAttribute(name, value) {
  const attributeName = AttributesMap.get(name.toLowerCase());

  if (attributeName === undefined) return null;

  let cookieAttribute;

  if (BooleanAttributes.has(attributeName)) {
    cookieAttribute = attributeName;
  } else {
    cookieAttribute = createCookie(attributeName, getAttributeValue(attributeName, value));
  }

  return `${ATTRIBUTE_DELIMITER}${WHITE_SPACE}${cookieAttribute}`;
}

/* Note that the expires attribute value needs to be a UTCString see: https://datatracker.ietf.org/doc/html/rfc2616#section-3.3 */
function addCookieAttributes(cookie, attributes) {
  let result = cookie;

  for (const [name, value] of Object.entries(attributes)) {
    const cookieAttribute = createCookieAttribute(name, value);

    if (cookieAttribute !== null) result += cookieAttribute;
  }

  return result;
}

/* Note, to remove a cookie, the Path and the Domain attribute must match with the existing cookie. */
function removeCookie(cookie) {
  const { key, attributes } = cookie;
  const date = new Date();

  /* The date has to be set in the past in order to remove the cookie */

  date.setDate(date.getDate() - 1);

  attributes.expires = date;

  document.cookie = addCookieAttributes(createCookie(key), attributes);
}

function setCookie(...cookies) {
  cookies.forEach((cookie) => {
    const { key, value, attributes = {} } = cookie;

    /* If the value is set to null, the cookie will be removed */
    if (value === null) {
      removeCookie({ key, attributes });
    } else if (value !== undefined) {
      document.cookie = addCookieAttributes(createCookie(key, encodeURIComponent(value)), attributes);
    }
  });
}

describe('Membership registration author as other', () => {
  let personalDetails = {};
  let contactDetails = {};
  let iBAN;
  let citizenServiceNumber;
  let bic;
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
      firstNames: 'Sponge',
      lastName: 'Bob Squarepants',
      dateOfBirth: '18-11-1950',
    });
    contactDetails = createContactDetails({ email: 'vincent+newmember@gmail.com' });

    const { 'sso-access-token': ssoAccessToken } = getCookie('sso-access-token');

    await loginUser('backstage');
    await loginUser('debug');
    await loginUser('non_member');

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
      await startAuthorAsManagerRegistration();
    });
  });

  describe('Persoonlijke data', () => {
    test('should go to Persoonlijke gegevens page', async () => {
      await clickPersonalDataSection();
      await waitForPageload();
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
      await waitForPageload();
    });

    test('firstName should not be pre filled', async () => {
      const input = await screen.getBySelector('#firstName');

      expect(input.value).toEqual('');
    });

    test('firstNames should not be pre filled', async () => {
      const input = await screen.getBySelector('#firstNames');

      expect(input.value).toEqual('');
    });

    test('lastName should not be pre filled', async () => {
      const input = await screen.getBySelector('#lastName');

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
      const input = await screen.getBySelector('#citizenServiceNumber');
      await user.type(input, citizenServiceNumber);
      await user.click(await screen.getByText('Ja'));
    });

    test('should save personal details', async () => {
      await clickButton('Opslaan');
    });

    test('should go to Contact gegevens page', async () => {
      await page.location(/\/contact-details$/);
      await waitForPageload();
    });

    test('email should not be pre filled', async () => {
      const input = await screen.getBySelector('#email');

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
      await waitForPageload();
    });

    test('should fill in personal payment details IBAN', async () => {
      const input = await screen.getBySelector('#iban');

      await user.type(input, iBAN);
      await event.blur(input);
      await user.click(await screen.getBySelector('#confirmIban'));
    });

    test('should save personal payment details', async () => {
      await clickButton('Opslaan');
    });

    test('should go to Persoonlijke data page', async () => {
      await page.location(/\/personal-data$/);
      await waitForPageload();
    });

    test('should go to Start je registratie page', async () => {
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

      await screen.getByText(iBAN);
    });
  });

  describe('Identificeren', () => {
    test('should go to identification overview page', async () => {
      await clickIdentificationSection();
      await page.location(/\/identification$/);
      await waitForPageload();
    });

    test('should go to identification form page', async () => {
      await user.click(await screen.getByText('Invullen', 'button'));
      await page.location(/\/identification\/form$/);
      await waitForPageload();
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
        await waitForPageload();
        await screen.getByRole('button', { name: 'In behandeling', disabled: true });
      });

      test('should approve identification by backstage', async () => {
        const { data } = await graphQL.membershipActiveRegistrations();
        const [registration] = data.membershipActiveRegistrations;

        const fetch = () =>
          new Promise(async (resolve) => {
            const result = await graphQL.approveIdentificationByIdentificationDocument(registration.identification.id);

            setTimeout(async () => {
              resolve(result.data);
            }, 3000);
          });

        const result = await fetch();

        expect(result).toBeDefined();
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

      await waitForPageload();
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
      const result = await graphQL.membershipActiveRegistrations();

      await restApi.memberRelationIPIBaseNumberWasAdded(
        {
          personalDetails: { ...personalDetails, citizenServiceNumber },
          personalContactDetails: contactDetails,
          personalPaymentDetails: {
            bankAccountNumber,
            bic,
            bankName,
            iBAN,
          },
        },
        result.data.membershipActiveRegistrations[0].rightsholder.ipBaseNumber,
      );
    });
  });
});
