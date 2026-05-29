import type { FilterOptionItem } from "./filterTypes";

export const FILTER_YEAR_MIN = 2000;
export const FILTER_YEAR_MAX = new Date().getFullYear() + 1;
export const FILTER_TONS_MIN = 1;
export const FILTER_TONS_MAX = 27;
export const FILTER_DISTANCE_MIN = 0;
export const FILTER_DISTANCE_MAX = 200;

export type ParsedFilterInfo = {
  manufacturers: FilterOptionItem[];
  loadedTypes: FilterOptionItem[];
  axis: FilterOptionItem[];
  transmission: FilterOptionItem[];
};

export const parseFilterInfo = (payload: unknown): ParsedFilterInfo => {
  const data = (payload ?? {}) as Record<string, unknown>;

  const manufacturers = Array.isArray(data.manufacturerCategories)
    ? data.manufacturerCategories
        .map((item: any) => ({
          code: String(item?.manufacturerCategories?.id ?? ""),
          label: String(item?.manufacturerCategories?.name ?? ""),
          count: Number(item?.count ?? 0),
        }))
        .filter((item) => item.code && item.label)
    : [];

  const loadedTypes = Array.isArray(data.loaded)
    ? data.loaded
        .map((item: any) => ({
          code: String(item?.loaded?.code ?? ""),
          label: String(item?.loaded?.desc ?? ""),
          count: Number(item?.count ?? 0),
        }))
        .filter((item) => item.code && item.label)
    : [];

  const axis = Array.isArray(data.axis)
    ? data.axis
        .map((item: any) => ({
          code: String(item?.axis?.code ?? ""),
          label: String(item?.axis?.desc ?? ""),
          count: Number(item?.count ?? 0),
        }))
        .filter((item) => item.code && item.label)
    : [];

  const transmission = Array.isArray(data.transmission)
    ? data.transmission
        .map((item: any) => ({
          code: String(item?.transmission?.code ?? ""),
          label: String(item?.transmission?.desc ?? ""),
          count: Number(item?.count ?? 0),
        }))
        .filter((item) => item.code && item.label)
    : [];

  return { manufacturers, loadedTypes, axis, transmission };
};
