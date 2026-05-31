export function daysAgoIsoDate(days: number, now: Date = new Date()): string {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
