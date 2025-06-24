import { describe, test, page, screen, user, expect } from '@e2e/index.js';
import { waitForPageload, padNumber, notOnScreen } from '../../utils/index.js';

async function hasFilters() {
  await screen.getByLabel('Zoekterm');
  await screen.getByLabel('Registratie type');
  await screen.getByLabel('Naam type');
  await screen.getByLabel('Transactie id');
  await screen.getByLabel('Volgorde');
  await screen.getByLabel('Van');
  await screen.getByLabel('Tot');

  await screen.getByRole('button', { name: 'Reset filters' });
  await screen.getByRole('button', { name: 'Filter' });
}

describe('Backstage membership registration sanity', () => {
  describe('Registratie overzicht', () => {
    test('should show registration overview page', async () => {
      await page.location(/\/registrations\/overview$/);
      await screen.findByRole('heading', { level: 1, name: 'Registratie overzicht' });
    });

    test('should show menu items', async () => {
      await screen.getByRole('heading', { name: 'Registratie overzicht' });
      await screen.getByRole('link', { name: 'Registratie overzicht' });
      await screen.getByRole('link', { name: 'Bankafschrift goedkeuring' });
      await screen.getByRole('link', { name: 'Identificatie goedkeuring' });
      await screen.getByRole('link', { name: 'Geblokkeerd door Suisa' });
    });

    test('should show filters', async () => {
      await hasFilters();
    });

    test('should be able to filter registrations', async () => {
      const from = new Date();
      const to = new Date();

      from.setDate(from.getDate() - 1);

      await user.type(await screen.getByLabel<HTMLInputElement>('Zoekterm'), 'test');
      await user.selectOptions(await screen.getByLabel<HTMLSelectElement>('Registratie type'), 'AUTHOR');
      await user.selectOptions(await screen.getByLabel<HTMLSelectElement>('Naam type'), 'PERSONAL');
      await user.type(await screen.getByLabel<HTMLInputElement>('Transactie id'), '12345');
      await user.selectOptions(await screen.getByLabel<HTMLSelectElement>('Volgorde'), 'DESC');
      await user.click(await screen.getBySelector('[aria-label="Choose date"]'));
      await user.click(await screen.getByRole('button', { name: padNumber(from.getDate().toString()) }));

      await notOnScreen('.MuiPickersLayout-root');

      await user.click(await screen.getBySelector('[aria-label="Choose date"]'));
      await user.click(await screen.getByRole('button', { name: padNumber(to.getDate().toString()) }));

      await notOnScreen('.MuiPickersLayout-root');

      await user.click(await screen.getByRole('button', { name: 'Filter' }));
      await waitForPageload();
    });

    test('should be able to reset filters', async () => {
      await user.click(await screen.getByRole('button', { name: 'Reset filters' }));
      await waitForPageload();

      const search = await screen.getByLabel('Zoekterm');
      const registrationType = await screen.getByLabel('Registratie type');
      const nameType = await screen.getByLabel('Naam type');
      const transactionId = await screen.getByLabel('Transactie id');
      const order = await screen.getByLabel('Volgorde');
      const from = await screen.getByLabel('Van');
      const to = await screen.getByLabel('Tot');

      expect(search.value).toEqual('');
      expect(registrationType.value).toEqual('AUTHOR');
      expect(nameType.value).toEqual('PERSONAL');
      expect(transactionId.value).toEqual('');
      expect(order.value).toEqual('DESC');
      expect(from.value).toEqual('');
      expect(to.value).toEqual('');
    });
  });

  describe('Registratie bekijken', () => {
    test('should show registration details page', async () => {
      await user.click(await screen.getByText('ac2e17a0-36d6-49ca-9dd1-490b6aeb04c9'));
      await waitForPageload();
    });

    test('should show delete registration button', async () => {
      await screen.getByRole('button', { name: 'Registratie verwijderen' });
    });

    test('should show tabs', async () => {
      const tabs = await screen.getByRole('radiogroup');

      await screen.getByText('Persoonlijke data', { container: tabs });
      await screen.getByText('Identificatie', { container: tabs });
      await screen.getByText('Rechten beheren', { container: tabs });
      await screen.getByText('Contract ondertekenen', { container: tabs });
    });

    test('should show personal details', async () => {
      await screen.getByRole('heading', { level: 4, name: 'Persoonsgegevens' });
      await screen.getByText('Voornaam');
      await screen.getByText('Voornamen');
      await screen.getByText('Achternaam');
      await screen.getByText('Tussenvoegsel');
      await screen.getByText('Nationaliteit');
      await screen.getByText('Geboorteplaats');
      await screen.getByText('Geboorteland');
      await screen.getByText('Geboortedatum');
      await screen.getByText('Burgerservicenummer');
      await screen.getByText('Geslacht');
    });

    test('should show contact details', async () => {
      await screen.getByRole('heading', { level: 4, name: 'Contactgegevens' });
      await screen.getByText('Straat');
      await screen.getByText('Huisnummer');
      await screen.getByText('Huisnummer toevoeging');
      await screen.getByText('Plaats');
      await screen.getByText('Postcode');
      await screen.getByText('Land');
      await screen.getByText('Telefoonnummer');
      await screen.getByText('E-mail');
    });

    test('should show payment details', async () => {
      await screen.getByRole('heading', { level: 4, name: 'Betalingsgegevens' });
      await screen.getByText('Banknaam');
      await screen.getByText('BIC');
      await screen.getByText('Bankrekeningnummer');
      await screen.getByText('IBAN');
      await screen.getByText('Bankafschrift');
      await screen.getByText('Reden afwijzing');
    });

    describe('Identificatie', () => {
      test.only('should go to edit personal data page', async () => {
        await user.click(await screen.getBySelector('[aria-label="more"]'));
        await user.click(await screen.getByRole('menuitem'));
        await waitForPageload();
      });
    });
  });

  describe('Bankafschrift goedkeuring', () => {
    test('should show bank statement approval page', async () => {
      await user.click(await screen.getByRole('link', { name: 'Bankafschrift goedkeuring' }));
      await page.location(/registrations\/bank-statement-approval$/);
      await waitForPageload();
      await screen.getByRole('heading', { level: 1, name: 'Bankafschrift goedkeuring' });
    });

    test('should show filters', async () => {
      await hasFilters();
    });
  });

  describe('Identificatie goedkeuring', () => {
    test('should show bank identification approval page', async () => {
      await user.click(await screen.getByRole('link', { name: 'Identificatie goedkeuring' }));
      await page.location(/registrations\/identification-approval$/);
      await waitForPageload();
      await screen.getByRole('heading', { level: 1, name: 'Identificatie goedkeuring' });
    });

    test('should show filters', async () => {
      await hasFilters();
    });
  });

  describe('Geblokkeerd door Suisa', () => {
    test('should show blokked by suisa page', async () => {
      await user.click(await screen.getByRole('link', { name: 'Geblokkeerd door Suisa' }));
      await page.location(/registrations\/blocked-by-suisa$/);
      await waitForPageload();
      await screen.getByRole('heading', { level: 1, name: 'Geblokkeerd door Suisa' });
    });

    test('should show filters', async () => {
      await hasFilters();
    });
  });
});
