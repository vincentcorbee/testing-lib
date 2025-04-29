import { event, user, page, screen } from '../../../dist/index.js';
import { pickDate, padNumber } from '../../utils/index.js';
import { waitForPageload } from '../helpers.js';

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
  await user.type('#name', companyDetails.name);
  await pickDate(await screen.getBySelector('#dateOfIncorporation'), companyDetails.dateOfIncorporation);
  await user.selectOptions('#legalForm', companyDetails.legalForm);
  await user.type('#zipCode', companyDetails.zipcode);
  await user.type('#houseNumber', companyDetails.houseNumber);
  await user.type('#houseNumberAddition', companyDetails.houseNumberAddition);
  await user.type('#street', companyDetails.street);
  await user.type('#city', companyDetails.city);
  await user.selectOptions('#country', companyDetails.country);
  await user.type('#vatNumber', companyDetails.vatNumber);
  await user.type('[name="telephoneNumber"]', companyDetails.phoneNumber);
  await user.type('#email', companyDetails.email);
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
    legalForm: '42',
    zipcode: faker.location.zipCode(),
    houseNumber: faker.location.buildingNumber(),
    houseNumberAddition: faker.location.secondaryAddress(),
    street: faker.location.street(),
    city: faker.location.city(),
    country: 'NL',
    vatNumber: faker.string.numeric(8),
    phoneNumber: '+31 6 12 345 678',
    email: faker.internet.email(),
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

export async function startPublisherAsOwnerRegistration() {
  await clickStartRegistrationAsPublisherCard();
  await waitForPageload();
  await page.location(/overview$/);
  await screen.getByRole('heading', { name: 'Start je registratie' });
}

export async function fillCompanyPaymentDetailsBankAccount(bankAccountNumber, bankName, bic) {
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
