const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDateJa(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAY_JA[d.getDay()]}）`;
}

export function formatDateRange(startDate: string, endDate: string): string {
  const [sy, sm, sd] = startDate.split("-");
  const [, em, ed] = endDate.split("-");
  return `${sy}.${sm}.${sd} — ${em}.${ed}`;
}

export function formatCityDates(startDate: string, endDate: string): string {
  const [, sm, sd] = startDate.split("-").map(Number);
  const [, em, ed] = endDate.split("-").map(Number);
  return sm === em ? `${sm}/${sd}–${ed}` : `${sm}/${sd}–${em}/${ed}`;
}

export function countDays(startDate: string, endDate: string): number {
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.round(ms / 86_400_000) + 1;
}
