import type { Job, JobEnumField, JobSearchParams } from "@/src/features/job/types";
import {
  JOB_TONS_MAX,
  JOB_TONS_MIN,
} from "@/src/features/job/constants";
import { formatNumberWithComma } from "@/src/features/home/utils";

export function defaultJobSearchParams(): JobSearchParams {
  return {
    minTons: JOB_TONS_MIN,
    maxTons: JOB_TONS_MAX,
    workingArea: { code: "", desc: "" },
    workingDays: { code: "", desc: "" },
    workingHours: { code: "", desc: "" },
  };
}

export function isDefaultJobSearchParams(params: JobSearchParams): boolean {
  return (
    params.minTons === JOB_TONS_MIN &&
    params.maxTons === JOB_TONS_MAX &&
    !params.workingArea?.code &&
    !params.workingDays?.code &&
    !params.workingHours?.code
  );
}

export function buildJobSearchQuery(
  params: JobSearchParams,
  page: number,
): Record<string, string> {
  const query: Record<string, string> = { page: String(page) };
  query.minTons = String(params.minTons);
  query.maxTons = String(params.maxTons);
  if (params.workingArea?.code) {
    query.workingArea = params.workingArea.code;
  }
  if (params.workingDays?.code) {
    query.workingDays = params.workingDays.code;
  }
  if (params.workingHours?.code) {
    query.workingHours = params.workingHours.code;
  }
  return query;
}

export function formatJobTitle(item: Job): string {
  if (item.minTons === item.maxTons) {
    return `${item.minTons}톤 ${item.title}`;
  }
  return `${item.minTons}톤 ~ ${item.maxTons}톤 ${item.title}`;
}

export function formatJobHour(hour: number): string {
  return hour < 10 ? `0${hour}:00` : `${hour}:00`;
}

export function formatJobTimeRange(startHour: number, endHour: number): string {
  return `${formatJobHour(startHour)} ~ ${formatJobHour(endHour)}`;
}

export function formatJobSalary(item: Job): string {
  const amount = formatNumberWithComma(item.salary);
  const type = item.salaryType?.desc;
  return type ? `${amount}원 (${type})` : `${amount}원`;
}

export function enumLabel(field?: JobEnumField): string {
  return field?.desc?.trim() ?? "";
}
