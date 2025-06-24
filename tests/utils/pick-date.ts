import { screen, user, wait } from '@e2e/index.js';

const monthMap = {
  1: 'jan',
  2: 'feb',
  3: 'mrt',
  4: 'apr',
  5: 'may',
  6: 'jun',
  7: 'jul',
  8: 'aug',
  9: 'sep',
  10: 'oct',
  11: 'nov',
  12: 'dec',
};

const getDateParts = (date: string) => date.split('-');

const formatSelectedDate = (selectedDate: string) => {
  const [day, month, year] = selectedDate.split('-');

  return `${parseInt(day)} ${monthMap[parseInt(month)]}. ${year}`;
};

export async function pickDate(parent: Node, date: string, selectedDate?: string) {
  const [day, month, year] = getDateParts(date);
  const currentDate = new Date();
  const currentMonth = selectedDate ? parseInt(getDateParts(selectedDate)[1]) : currentDate.getMonth() + 1;
  const delta = parseInt(month) - currentMonth;
  const label = selectedDate ? `Choose date, selected date is ${formatSelectedDate(selectedDate)}` : 'Choose date';

  await user.click(await screen.getByRole('button', { label, container: parent }));
  await user.click(await screen.getByRole('button', { label: 'calendar view is open, switch to year view' }));
  await user.click(await screen.getByRole('button', { name: year }));

  const nextButton = await screen.getByRole('button', { label: `${delta > 0 ? 'Next' : 'Previous'} month` });

  for (let i = 0, l = Math.abs(delta); i < l; i++) {
    await user.click(nextButton);
  }

  await wait(500);

  await user.click(await screen.getByRole('button', { name: parseInt(day, 10).toString() }));
}
