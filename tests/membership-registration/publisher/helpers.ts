import { event, user, page, screen } from '@e2e/index.js';
import { pickDate, padNumber, waitForPageload } from '../../utils/index.js';

export async function clickStartRegistrationAsPublisherCard() {
  await user.click('#publisher');
  await user.click('#publisher button:nth-child(1)');
}

export async function clickCompanyDataSection() {
  await user.click('section:nth-child(1) button');
}

export async function clickCompanyDetailsSection() {
  await user.click('section:nth-child(2) button');
}

export async function clickIdentificationSection() {
  await user.click('section:nth-child(2) button');
}

export async function clickOtherIdentificationCard(index = 1) {
  await user.click(await screen.getByText('Selecteren', { index }));
}

export async function fillInCompanyDetails(companyDetails) {
  await user.type('#chamberOfCommerceNumber', companyDetails.chamberOfCommerceNumber);
  await user.type('#sbi', companyDetails.sbi);
  await user.type('#name', companyDetails.name);
  await user.selectOptions('#legalForm', companyDetails.legalForm);
  await pickDate(await screen.getBySelector('#dateOfIncorporation'), companyDetails.dateOfIncorporation);
  await user.type('#zipCode', companyDetails.zipCode);
  await user.type('#houseNumber', companyDetails.houseNumber);
  await user.type('#houseNumberAddition', companyDetails.houseNumberAddition);
  await user.type('#street', companyDetails.street);
  await user.type('#city', companyDetails.city);
  await user.selectOptions('#country', companyDetails.country);
  await user.type('#vatNumber', companyDetails.vatNumber);
}

export async function clickButton(name) {
  await user.click(await screen.getByRole('button', { name }));
}

export function createCompanyDetails(details = {}) {
  const name = faker.company.name();
  const dateOfIncorporation = faker.date.past(10);

  return {
    name,
    chamberOfCommerceNumber: faker.string.numeric(8),
    dateOfIncorporation: `${padNumber(dateOfIncorporation.getDate())}-${padNumber(dateOfIncorporation.getMonth() || 1)}-${dateOfIncorporation.getFullYear()}`,
    legalForm: '41',
    zipCode: faker.location.zipCode(),
    houseNumber: faker.location.buildingNumber(),
    houseNumberAddition: faker.location.secondaryAddress(),
    street: faker.location.street(),
    city: faker.location.city(),
    country: 'NL',
    vatNumber: 'NL123456789B01',
    rsin: '123456789',
    sbi: '12345',
    ...details,
  };
}

export function createContactDetails(details = {}) {
  const birthdate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
  const firstName = faker.person.firstName();
  const lastNames = faker.person.lastName().split(' ');
  const lastName = lastNames.pop();
  const infix = lastNames.join(' ');

  return {
    firstName,
    lastName,
    dateOfBirth: `${padNumber(birthdate.getDate())}-${padNumber(birthdate.getMonth() || 1)}-${birthdate.getFullYear()}`,
    sex: faker.person.sex()[0].toUpperCase(),
    infix,
    telephoneNumber: '+31 6 12 345 678',
    email: faker.internet.email(),
    country: 'NL',
    ...details,
  };
}

export async function startPublisherAsOwnerRegistration() {
  await clickStartRegistrationAsPublisherCard();
  await waitForPageload();
  await page.location(/overview$/);
  await screen.getByRole('heading', { name: 'Start je registratie' });
}

export async function fillCompanyPaymentDetailsBankAccount(bankAccountNumber, bankName, bic) {
  await user.click(await screen.getByText('Ik heb geen IBAN rekeningnummer'));

  const inputBankAccountNumber = await screen.getBySelector<HTMLInputElement>('#bankAccountNumber');
  const inputBankName = await screen.getBySelector<HTMLInputElement>('#bankName');
  const inputBic = await screen.getBySelector<HTMLInputElement>('#bic');

  await user.type(inputBankAccountNumber, bankAccountNumber);
  await user.type(inputBankName, bankName);
  await user.type(inputBic, bic);

  await event.blur(inputBic);

  await user.upload('#bankStatement-input', new File(['Hello'], 'my-file.pdf', { type: 'application/pdf' }));
}
