export function padNumber(number) {
  return number < 10 ? `0${number}` : number.toString();
}
