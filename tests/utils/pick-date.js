import { screen, user, wait } from '../../dist/index.js';

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

  await user.click(await screen.getByRole('button', { name: parseInt(day, 10) }));
}
