export function roundToHour(date: Date) {
  const p = 60 * 60 * 1000;
  return new Date(Math.round(date.getTime() / p) * p);
}
