import { beforeAll, describe, test, screen, navigation, user, page } from '@e2e/index.js';
import { padNumber } from '../utils/pad-number.js';

async function hasFieldError(label: string, errorMessage: string) {
  return screen.getByText(errorMessage, { container: (await screen.getByLabel(label)).parentElement ?? undefined });
}

function createDateSring(date: Date) {
  return `${padNumber(date.getDate())}-${padNumber(date.getMonth() + 1)}-${date.getFullYear()}`;
}

describe('Residency Information', () => {
  let issuingDate: Date;
  let startDate: Date;
  let endDate: Date;
  let endDateBeforeStartDate: Date;
  let minDate: Date;
  let issuingCountry: string;
  let issuingCountryCode: string;
  let country: string;
  let countryCode: string;
  let fileName: string;

  beforeAll(() => {
    issuingDate = new Date();
    startDate = new Date();
    endDate = new Date();
    endDateBeforeStartDate = new Date();
    issuingCountry = 'Afghanistan';
    issuingCountryCode = 'AF';
    country = 'Nederland';
    countryCode = 'NL';
    minDate = new Date(1900, 0, 1);
    fileName = 'my-file.pdf';

    minDate.setDate(minDate.getDate() - 1);
    endDate.setDate(startDate.getDate() + 1);

    console.clear();
  });

  test('it should display overview page', async () => {
    await screen.getByRole('heading', { name: 'Woonplaatsverklaringen' });
    await screen.getByRole('link', { name: 'Woonplaatsverklaring toevoegen' });
    await screen.getByText(
      'Let op! Controleer voordat je je woonplaatsverklaringen gaat invullen je BSN / RSIN nummer onder ‘mijn gegevens’.',
    );
  });

  test('it should go to create page page', async () => {
    // await user.click(await screen.getByRole('link', { name: 'Woonplaatsverklaring toevoegen' }));
    navigation.navigate('/profile/residency-information/add');

    await page.location(/residency-information\/add$/);

    await screen.getByRole('heading', { level: 1, name: 'Woonplaatsverklaring invullen' });
  });

  test('it should show required field errors', async () => {
    await user.upload(
      '#residencyInformationDocument-input',
      new File(['Hello'], fileName, { type: 'application/pdf' }),
    );
    await user.click(await screen.getBySelector('#confirmInformation'));
    await user.click(await screen.getByRole('button', { name: 'Opslaan en verder' }));

    await hasFieldError('Land van afgifte', 'Dit veld is verplicht.');
    await hasFieldError('Land waarvoor verklaring is afgegeven', 'Dit veld is verplicht.');
    await hasFieldError('Datum van afgifte', 'Datum van afgifte is ongeldig');
    await hasFieldError('Ingangsdatum verklaring', 'Ingangsdatum verklaring is ongeldig');
    await hasFieldError('Einddatum verklaring', 'Einddatum verklaring is ongeldig');
  });

  test('it should show end date before start date error', async () => {
    await user.type(await screen.getByLabel<HTMLInputElement>('Datum van afgifte'), createDateSring(issuingDate));
    await user.type(await screen.getByLabel<HTMLInputElement>('Ingangsdatum verklaring'), createDateSring(startDate));
    await user.type(
      await screen.getByLabel<HTMLInputElement>('Einddatum verklaring'),
      createDateSring(endDateBeforeStartDate),
    );

    await hasFieldError('Einddatum verklaring', 'Einddatum moet na de startdatum liggen');
  });

  test('Issue date should be after 01-01-1900', async () => {
    await user.type(await screen.getByLabel<HTMLInputElement>('Datum van afgifte'), createDateSring(minDate));

    await hasFieldError('Einddatum verklaring', 'Datum van afgifte moet na 01-01-1900 liggen');
  });

  test('Start date should be after 01-01-1900', async () => {
    await user.type(await screen.getByLabel<HTMLInputElement>('Ingangsdatum verklaring'), createDateSring(minDate));

    await hasFieldError('Ingangsdatum verklaring', 'Datum van afgifte moet na 01-01-1900 liggen');
  });

  test('Start date should be after 01-01-1900', async () => {
    await user.type(await screen.getByLabel<HTMLInputElement>('Einddatum verklaring'), createDateSring(minDate));

    await hasFieldError('Einddatum verklaring', 'Einddatum moet na 01-01-1900 liggen');

    await user.click(await screen.getBySelector('#confirmInformation'));
    await user.click(await screen.getByTestId('DeleteIcon', { testIdAttribute: 'testid' }));
  });

  test('it should fill in details', async () => {
    await screen.getByRole('button', { name: 'Opslaan en verder', disabled: true });

    await user.selectOptions(await screen.getByLabel<HTMLSelectElement>('Land van afgifte'), countryCode);
    await user.selectOptions(
      await screen.getByLabel<HTMLSelectElement>('Land waarvoor verklaring is afgegeven'),
      issuingCountryCode,
    );
    await user.type(await screen.getByLabel<HTMLInputElement>('Datum van afgifte'), createDateSring(issuingDate));
    await user.type(await screen.getByLabel<HTMLInputElement>('Ingangsdatum verklaring'), createDateSring(startDate));
    await user.type(await screen.getByLabel<HTMLInputElement>('Einddatum verklaring'), createDateSring(endDate));
    await user.upload(
      '#residencyInformationDocument-input',
      new File(['Hello'], 'my-file.txt', { type: 'text/plain' }),
    );

    await screen.getByText('Ongeldig bestandstype. Alleen DOC, DOCX, PDF, PNG, JPG en JPEG zijn toegestaan.');

    await user.upload(
      '#residencyInformationDocument-input',
      new File(['Hello'], fileName, { type: 'application/pdf' }),
    );

    await screen.getByText(fileName);
    await screen.getByRole('button', { name: 'Opslaan en verder', disabled: true });

    await user.click(await screen.getBySelector('#confirmInformation'));
  });

  test('it should save residency information', async () => {
    await user.click(await screen.getByRole('button', { name: 'Opslaan en verder' }));

    await page.location(/residency-information$/);
  });

  test('it should show residency information', async () => {
    await screen.getByText(country);
    await screen.getByText(createDateSring(startDate));
    await screen.getByText(createDateSring(endDate));
  });

  describe('Residency information view page', () => {
    test('should see residency information details', async () => {
      await user.click(await screen.getByTestId('VisibilityOutlinedIcon', { testIdAttribute: 'testid' }));

      await page.location(/residency-information\/view\/.+$/);

      await screen.getByText(country);
      await screen.getByText(issuingCountry);
      await screen.getByText(createDateSring(new Date()));
      await screen.getByText(createDateSring(issuingDate));
      await screen.getByText(createDateSring(startDate));
      await screen.getByText(createDateSring(endDate));
      await screen.getByText(fileName);
    });
  });
});
