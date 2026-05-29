/** 서버 driveHistoryTime(0–23) → "오후 7시" */
export function formatDriveHistoryTimeAmPm(hour: number): string {
  const hours = hour >= 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? "오후" : "오전";
  const convertedHours = hours === 0 ? 12 : hours;
  return `${ampm} ${convertedHours}시`;
}

export function parseDriveHistoryHour(value?: string | number | null): number {
  if (value == null || value === "") return 8;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const raw = String(value);
  if (/^\d{1,2}$/.test(raw)) return Number(raw);
  const match = raw.match(/^(\d{1,2}):/);
  if (match) return Number(match[1]);
  return 19;
}

/** 웹 NotificationTimeSetting.calculateTime 과 동일 */
export function pickerIndicesToHour(amPmIndex: number, timeIndex: number): number {
  if (amPmIndex === 0 && timeIndex === 11) return 0;
  if (amPmIndex === 1 && timeIndex === 11) return 12;
  if (amPmIndex === 0) return timeIndex + 1;
  return timeIndex + 13;
}

export function hourToPickerIndices(hour: number): { amPmIndex: number; timeIndex: number } {
  if (hour === 0) return { amPmIndex: 0, timeIndex: 11 };
  if (hour === 12) return { amPmIndex: 1, timeIndex: 11 };
  if (hour < 12) return { amPmIndex: 0, timeIndex: hour - 1 };
  return { amPmIndex: 1, timeIndex: hour - 13 };
}

export const AMPM_OPTIONS = ["오전", "오후"] as const;
export const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));
