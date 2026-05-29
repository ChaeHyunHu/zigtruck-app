import {
  FILTER_DISTANCE_MAX,
  FILTER_DISTANCE_MIN,
  FILTER_TONS_MAX,
  FILTER_TONS_MIN,
  FILTER_YEAR_MAX,
  FILTER_YEAR_MIN,
} from "@/src/features/products/filterConstants";

import type { InterestNotificationFormState, InterestNotificationSettingItem } from "./types";

export function getDefaultInterestNotificationFormState(): InterestNotificationFormState {
  return {
    loadedCodes: [],
    minLoadedInnerLength: "",
    maxLoadedInnerLength: "",
    minTons: String(FILTER_TONS_MIN),
    maxTons: String(FILTER_TONS_MAX),
    minYear: String(FILTER_YEAR_MIN),
    maxYear: String(FILTER_YEAR_MAX),
    minDistance: String(FILTER_DISTANCE_MIN),
    maxDistance: String(FILTER_DISTANCE_MAX),
    axisCode: "",
    transmissionCode: "",
    manufacturerIds: [],
  };
}

export function normalizeInterestNotificationSettings(
  payload: unknown,
): InterestNotificationSettingItem[] {
  if (!Array.isArray(payload)) return [];
  return payload as InterestNotificationSettingItem[];
}

export function formatRange(
  min?: number | null,
  max?: number | null,
  unit = "",
): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) {
    if (min === max) return `${min}${unit}`;
    return `${min}${unit} ~ ${max}${unit}`;
  }
  if (min != null) return `${min}${unit} ~`;
  return `~ ${max}${unit}`;
}

export type SettingCardRow = { label: string; value: string };

export function buildSettingCardRows(item: InterestNotificationSettingItem): SettingCardRow[] {
  const rows: SettingCardRow[] = [];

  const loaded = item.loaded?.map((x) => x.desc).filter(Boolean).join(", ");
  if (loaded) rows.push({ label: "적재함 종류", value: loaded });

  const tons = formatRange(item.minTons, item.maxTons, "t");
  if (tons) rows.push({ label: "톤수", value: tons });

  const years = formatRange(item.minYear, item.maxYear, "년");
  if (years) rows.push({ label: "연식", value: years });

  const length = formatRange(item.minLoadedInnerLength, item.maxLoadedInnerLength, "m");
  if (length) rows.push({ label: "적재함 길이", value: length });

  if (item.axis?.desc) rows.push({ label: "가변축", value: item.axis.desc });

  const manufacturers = item.manufacturerCategories?.map((m) => m.name).filter(Boolean).join(", ");
  if (manufacturers) rows.push({ label: "제조사", value: manufacturers });

  const distance = formatRange(item.minDistance, item.maxDistance, "km");
  if (distance) rows.push({ label: "주행거리", value: distance });

  if (item.transmission?.desc) rows.push({ label: "변속기", value: item.transmission.desc });

  return rows;
}

export function formStateFromSetting(
  item?: InterestNotificationSettingItem | null,
): InterestNotificationFormState {
  if (!item) {
    return getDefaultInterestNotificationFormState();
  }

  const defaults = getDefaultInterestNotificationFormState();

  return {
    loadedCodes: item.loaded?.map((l) => l.code ?? "").filter(Boolean) ?? [],
    minLoadedInnerLength:
      item.minLoadedInnerLength != null ? String(item.minLoadedInnerLength) : "",
    maxLoadedInnerLength:
      item.maxLoadedInnerLength != null ? String(item.maxLoadedInnerLength) : "",
    minTons: item.minTons != null ? String(item.minTons) : defaults.minTons,
    maxTons: item.maxTons != null ? String(item.maxTons) : defaults.maxTons,
    minYear: item.minYear != null ? String(item.minYear) : defaults.minYear,
    maxYear: item.maxYear != null ? String(item.maxYear) : defaults.maxYear,
    minDistance:
      item.minDistance != null ? String(item.minDistance) : defaults.minDistance,
    maxDistance:
      item.maxDistance != null ? String(item.maxDistance) : defaults.maxDistance,
    axisCode: item.axis?.code ?? "",
    transmissionCode: item.transmission?.code ?? "",
    manufacturerIds:
      item.manufacturerCategories
        ?.map((m) => (m.id != null ? String(m.id) : ""))
        .filter(Boolean) ?? [],
  };
}

export function buildInterestNotificationRequest(
  form: InterestNotificationFormState,
): Record<string, unknown> {
  const request: Record<string, unknown> = {
    loaded: form.loadedCodes.length ? form.loadedCodes.join(",") : null,
    minLoadedInnerLength: form.minLoadedInnerLength
      ? Number(form.minLoadedInnerLength)
      : null,
    maxLoadedInnerLength: form.maxLoadedInnerLength
      ? Number(form.maxLoadedInnerLength)
      : null,
    minTons: form.minTons ? Number(form.minTons) : null,
    maxTons: form.maxTons ? Number(form.maxTons) : null,
    minYear: form.minYear ? Number(form.minYear) : null,
    maxYear: form.maxYear ? Number(form.maxYear) : null,
    minDistance: form.minDistance ? Number(form.minDistance) : null,
    maxDistance: form.maxDistance ? Number(form.maxDistance) : null,
    axis: form.axisCode || null,
    transmission: form.transmissionCode || null,
    manufacturerCategoriesId: form.manufacturerIds.length
      ? form.manufacturerIds.join(",")
      : null,
  };

  if (request.minTons === FILTER_TONS_MIN && request.maxTons === FILTER_TONS_MAX) {
    request.minTons = null;
    request.maxTons = null;
  }
  if (request.minYear === FILTER_YEAR_MIN && request.maxYear === FILTER_YEAR_MAX) {
    request.minYear = null;
    request.maxYear = null;
  }
  if (request.minDistance === FILTER_DISTANCE_MIN && request.maxDistance === FILTER_DISTANCE_MAX) {
    request.minDistance = null;
    request.maxDistance = null;
  }

  return request;
}
