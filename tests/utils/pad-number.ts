export function padNumber(number: string | number) {
  if (typeof number === 'string') return number.padStart(2, '0');
  return number < 10 ? `0${number}` : number.toString();
}
