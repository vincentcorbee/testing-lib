import { event, expect, user, page, screen, request, wait } from '../../../dist/index.js';
import { padNumber } from '../../utils/pad-number.js';
import { waitForPageload } from '../helpers.js';

export async function pickDate(parent, date) {
  const [day, month, year] = date.split('-');
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const delta = parseInt(month) - currentMonth;

  await user.click(await screen.getByRole('button', { label: 'Choose date', container: parent }));
  await user.click(await screen.getByRole('button', { label: 'calendar view is open, switch to year view' }));
  await user.click(await screen.getByRole('button', { name: year }));

  const nextButton = await screen.getByRole('button', { label: `${delta > 0 ? 'Next' : 'Previous'} month` });

  for (let i = 0, l = Math.abs(delta); i < l; i++) {
    await user.click(nextButton);
  }

  await wait(500);

  await user.click(await screen.getByRole('button', { name: day }));
}

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

export async function clickOtherIdentificationCard(index = 1) {
  await user.click(await screen.getByText('Selecteren', { index }));
}

export async function fillInPersonalDetails(personalDetails) {
  await user.type('#firstName', personalDetails.firstName);
  await user.type('#firstNames', personalDetails.firstNames);
  await user.type('#lastName', personalDetails.lastName);
  await user.type('#infix', personalDetails.infix);
  // await user.input('#dateOfBirth', personalDetails.dateOfBirth);
  await pickDate(await screen.getBySelector('#dateOfBirth'), personalDetails.dateOfBirth);
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

export function createPersonalDetails(details = {}) {
  const birthdate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
  const firstName = faker.person.firstName();
  const lastNames = faker.person.lastName().split(' ');
  const lastName = lastNames.pop();
  const infix = lastNames.join(' ');

  return {
    firstName,
    firstNames: firstName,
    lastName,
    dateOfBirth: `${padNumber(birthdate.getDate())}-${padNumber(birthdate.getMonth() || 1)}-${birthdate.getFullYear()}`,
    sex: faker.person.sex()[0].toUpperCase(),
    placeOfBirth: faker.location.city(),
    countryOfBirth: 'NL',
    nationality: 'NL',
    infix,
    ...details,
  };
}

export function createContactDetails(details = {}) {
  return {
    zipCode: faker.location.zipCode(),
    houseNumber: faker.location.buildingNumber(),
    street: faker.location.street(),
    city: faker.location.city(),
    country: 'NL',
    telephoneNumber: '+31 6 12 345 678',
    email: faker.internet.email(),
    ...details,
  };
}

export async function startAuthorAsOwnerRegistration() {
  await clickStartRegistrationAsAuthorCard();
  await expect(
    request.waitForRequest('/graphql', async (request) => {
      if (!request.body.includes('startAuthorRegistrationAsOwner')) return false;

      const response = await request.json();

      if (response.errors !== undefined) return false;

      return true;
    }),
  ).resolves.toEqual(true);

  await page.location(/overview$/);
  await waitForPageload();
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
