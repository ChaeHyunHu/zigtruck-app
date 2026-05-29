const pad2 = (n: number) => String(n).padStart(2, "0");

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function formatWeekdayLabel(date: Date): string {
  return `${WEEKDAY_KO[date.getDay()]}요일`;
}

export function formatYYYYMMDD(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function formatYYYYMM(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function formatYYYYMMDot(date: Date): string {
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}`;
}

export function formatMonthDayLabel(date: Date): string {
  return `${pad2(date.getMonth() + 1)}월 ${pad2(date.getDate())}일`;
}

export function formatMonthLabel(date: Date): string {
  return `${pad2(date.getMonth() + 1)}월`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function parseYMD(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function getDayOfWeekFromYMD(ymd: string): string {
  return formatWeekdayLabel(parseYMD(ymd));
}

export function getDayOfMonthFromYMD(ymd: string): number {
  return parseYMD(ymd).getDate();
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function formatDisplayYYYYMM(date: Date): string {
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}`;
}

export function monthFromBaseDay(baseDay?: string): Date {
  if (!baseDay || baseDay.length < 7) return startOfMonth(new Date());
  const [y, m] = baseDay.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1);
}

export function getCalendarGrid(month: Date): (Date | null)[][] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1);
  const lastDate = new Date(year, m + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) cells.push(new Date(year, m, d));

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}
