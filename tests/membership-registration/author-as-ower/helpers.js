import { event, expect, user, page, screen, request, waitFor } from '../../../dist/index.js';
import { padNumber } from '../../utils/pad-number.js';

export async function clickStartRegistrationAsAuthorCard() {
  await user.click('#authorCard');
  await user.click('#authorCard button:nth-child(1)');
}

export async function clickPersonalDataSection() {
  await user.click('section:nth-child(1) button');
}

export async function clickPersonalDetailsSection() {
  await user.click('section:nth-child(2) button');
}

export async function clickIdentificationSection() {
  await user.click('section:nth-child(2) button');
}

export async function clickOtherIdentificationCard() {
  await user.click(await screen.getByText('Selecteren', { index: 1 }));
}

export async function fillInPersonalDetails(personalDetails) {
  await user.type('#firstName', personalDetails.firstName);
  await user.type('#firstNames', personalDetails.firstNames);
  await user.type('#lastName', personalDetails.lastName);
  await user.type('#dateOfBirth', personalDetails.dateOfBirth);
  await user.selectOptions('#sex', personalDetails.sex);
  await user.type('#placeOfBirth', personalDetails.placeOfBirth);
  await user.selectOptions('#countryOfBirth', personalDetails.countryOfBirth);
  await user.selectOptions('#nationality', personalDetails.nationality);
}

export async function fillInPersonalContactDetails(contactDetails) {
  await user.type('#zipCode', contactDetails.zipCode);
  await user.type('#houseNumber', contactDetails.houseNumber);
  await user.type('input[name=street]', contactDetails.street);
  await user.type('input[name=city]', contactDetails.city);
  await user.selectOptions('#country', contactDetails.country);
  await user.type('input[name=telephoneNumber]', contactDetails.telephoneNumber);
  await user.type('#email', contactDetails.email);
}

export async function clickButton(name) {
  await user.click(await screen.getByRole('button', { name }));
}

export function createPersonalDetails() {
  const birthdate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
  const firstName = faker.person.firstName();

  return {
    firstName,
    firstNames: firstName,
    lastName: faker.person.lastName(),
    dateOfBirth: `${padNumber(birthdate.getDate())}-${padNumber(birthdate.getMonth() || 1)}-${birthdate.getFullYear()}`,
    sex: faker.person.sex()[0].toUpperCase(),
    placeOfBirth: faker.location.city(),
    countryOfBirth: 'NL',
    nationality: 'NL',
  };
}

export function createContactDetails() {
  return {
    zipCode: faker.location.zipCode(),
    houseNumber: faker.location.buildingNumber(),
    street: faker.location.street(),
    city: faker.location.city(),
    country: 'NL',
    telephoneNumber: '+31 6 12 345 678',
    email: faker.internet.email(),
  };
}

export async function waitForPageload() {
  await screen.getByText('Bezig met laden...');

  await waitFor(async () => await expect(screen.findByText('Bezig met laden...')).resolves.toEqual(null));
}

export async function startAuthorAsOwnerRegistration() {
  await clickStartRegistrationAsAuthorCard();
  await expect(
    request.waitForRequest('/graphql', async (request) => {
      console.log(request.body);
      if (!request.body.includes('startAuthorRegistrationAsOwner')) return false;

      const response = await request.json();

      if (response.errors !== undefined) return false;

      return true;
    }),
  ).resolves.toEqual(true);

  await page.location(/overview$/);
  await screen.getByRole('heading', { name: 'Start je registratie' });
}

export async function fillPersonalPaymentDetailsBankAccount(bankAccountNumber, bankName, bic) {
  await user.click(await screen.getByText('Ik heb geen IBAN rekeningnummer'));

  const inputBankAccountNumber = await screen.getBySelector('#bankAccountNumber');
  const inputBankName = await screen.getBySelector('#bankName');
  const inputBic = await screen.getBySelector('#bic');

  await user.type(inputBankAccountNumber, bankAccountNumber);
  await user.type(inputBankName, bankName);
  await user.type(inputBic, bic);

  await event.blur(inputBic);

  await user.upload('#bankStatement-input', new File(['Hello'], 'my-file.pdf', { type: 'application/pdf' }));
}