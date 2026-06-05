import {
  FILTER_DISTANCE_MAX,
  FILTER_DISTANCE_MIN,
  FILTER_TONS_MAX,
  FILTER_TONS_MIN,
  FILTER_YEAR_MAX,
  FILTER_YEAR_MIN,
} from "./filterConstants";
import type { FilterOptionItem, ProductSearchFilters } from "./filterTypes";

/** expo-router URL params 에서 CSV(쉼표) 값이 잘리지 않도록 구분자 */
const ROUTER_CSV_SEPARATOR = "|";

const encodeRouterCsv = (value?: string): string => {
  if (!value) return "";
  return value.replace(/,/g, ROUTER_CSV_SEPARATOR);
};

const decodeRouterCsv = (value?: string): string | undefined => {
  if (!value) return undefined;
  if (value.includes(ROUTER_CSV_SEPARATOR)) {
    return value.replace(/\|/g, ",");
  }
  return value;
};

const getParamValue = (
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined => {
  const value = params[key];
  if (typeof value === "string") {
    return decodeRouterCsv(value);
  }
  if (Array.isArray(value)) {
    const joined = value
      .filter((item): item is string => typeof item === "string" && item.length > 0)
      .map((item) => decodeRouterCsv(item) ?? item)
      .join(",");
    return joined || undefined;
  }
  return undefined;
};

export const createDefaultFilters = (): ProductSearchFilters => ({
  yearMin: String(FILTER_YEAR_MIN),
  yearMax: String(FILTER_YEAR_MAX),
  tonsMin: String(FILTER_TONS_MIN),
  tonsMax: String(FILTER_TONS_MAX),
  loadedLengthMin: "",
  loadedLengthMax: "",
  distanceMin: String(FILTER_DISTANCE_MIN),
  distanceMax: String(FILTER_DISTANCE_MAX),
  sort: "createdAt,DESC",
  onlyOneTon: false,
});

const toBool = (value?: string) => value === "true";

export const mapSortToProductsSortType = (
  sort?: string,
): string | undefined => {
  switch (sort) {
    case "createdAt,DESC":
      return "CREATED_DATE";
    case "firstRegistrationDate,DESC":
      return "YEAR";
    case "distance,ASC":
      return "DISTANCE";
    default:
      return undefined;
  }
};

export const isClientOnlyProductSort = (sort?: string): boolean => {
  if (!sort) return false;
  return sort.startsWith("price") || sort === "firstRegistrationDate,ASC";
};

export const filtersFromParams = (
  params: Record<string, string | string[] | undefined>,
): ProductSearchFilters => {
  const defaults = createDefaultFilters();
  const get = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  };

  const transmission = get("transmission");
  const manufacturerCategoriesId =
    getParamValue(params, "manufacturerCategoriesId") ||
    getParamValue(params, "manufacturer") ||
    undefined;
  const loaded =
    getParamValue(params, "loaded") ||
    getParamValue(params, "loadedType") ||
    undefined;

  return {
    keyword: get("keyword") || undefined,
    yearMin: get("yearMin") ?? defaults.yearMin,
    yearMax: get("yearMax") ?? defaults.yearMax,
    tonsMin: get("tonsMin") ?? defaults.tonsMin,
    tonsMax: get("tonsMax") ?? defaults.tonsMax,
    manufacturerCategoriesId: manufacturerCategoriesId || undefined,
    loaded: loaded || undefined,
    loadedLengthMin: get("loadedLengthMin") ?? "",
    loadedLengthMax: get("loadedLengthMax") ?? "",
    axis:
      get("axis") && get("axis") !== "ALL" ? get("axis") : undefined,
    distanceMin: get("distanceMin") ?? defaults.distanceMin,
    distanceMax: get("distanceMax") ?? defaults.distanceMax,
    transmission:
      transmission && transmission !== "ALL" ? transmission : undefined,
    sort: get("sort") ?? defaults.sort,
    onlyOneTon: toBool(get("onlyOneTon")),
    salesType:
      get("salesType") && get("salesType") !== "ALL"
        ? get("salesType")
        : undefined,
  };
};

export const filtersToParams = (
  filters: ProductSearchFilters,
): Record<string, string> => ({
  keyword: filters.keyword ?? "",
  yearMin: filters.yearMin,
  yearMax: filters.yearMax,
  tonsMin: filters.tonsMin,
  tonsMax: filters.tonsMax,
  loadedLengthMin: filters.loadedLengthMin,
  loadedLengthMax: filters.loadedLengthMax,
  distanceMin: filters.distanceMin,
  distanceMax: filters.distanceMax,
  sort: filters.sort,
  onlyOneTon: filters.onlyOneTon ? "true" : "false",
  manufacturerCategoriesId: encodeRouterCsv(filters.manufacturerCategoriesId),
  loaded: encodeRouterCsv(filters.loaded),
  axis: filters.axis ?? "",
  transmission: filters.transmission ?? "",
  salesType: filters.salesType ?? "",
});

let pendingPurchaseFilterParams: Record<string, string> | null = null;

export const setPendingPurchaseFilterParams = (
  params: Record<string, string>,
) => {
  pendingPurchaseFilterParams = params;
};

export const takePendingPurchaseFilterParams = (): Record<
  string,
  string
> | null => {
  const params = pendingPurchaseFilterParams;
  pendingPurchaseFilterParams = null;
  return params;
};

export const hasActiveFilters = (filters: ProductSearchFilters): boolean => {
  const defaults = createDefaultFilters();
  return (
    Boolean(filters.keyword?.trim()) ||
    filters.yearMin !== defaults.yearMin ||
    filters.yearMax !== defaults.yearMax ||
    filters.tonsMin !== defaults.tonsMin ||
    filters.tonsMax !== defaults.tonsMax ||
    filters.distanceMin !== defaults.distanceMin ||
    filters.distanceMax !== defaults.distanceMax ||
    Boolean(filters.manufacturerCategoriesId) ||
    Boolean(filters.loaded) ||
    Boolean(filters.loadedLengthMin) ||
    Boolean(filters.loadedLengthMax) ||
    Boolean(filters.axis) ||
    Boolean(filters.transmission) ||
    filters.onlyOneTon !== defaults.onlyOneTon ||
    Boolean(filters.salesType)
  );
};

export const buildProductListQuery = (
  filters: ProductSearchFilters,
  page = 1,
  size = 20,
): Record<string, unknown> => {
  const query: Record<string, unknown> = {
    page,
    size,
    keyword: filters.keyword ?? "",
    minYear: filters.yearMin,
    maxYear: filters.yearMax,
    minTons: filters.onlyOneTon ? "1" : filters.tonsMin,
    maxTons: filters.onlyOneTon ? "1.2" : filters.tonsMax,
    minDistance:
      filters.distanceMin !== ""
        ? String(Number(filters.distanceMin) * 10000)
        : "",
    maxDistance:
      filters.distanceMax !== ""
        ? String(Number(filters.distanceMax) * 10000)
        : "",
    axis: filters.axis ?? "",
    transmission:
      filters.transmission === "BOTH"
        ? ""
        : (filters.transmission ?? ""),
    loaded: filters.loaded ?? "",
    minLoadedInnerLength: filters.loadedLengthMin ?? "",
    maxLoadedInnerLength: filters.loadedLengthMax ?? "",
    manufacturerCategoriesId: filters.manufacturerCategoriesId ?? "",
    salesType: filters.salesType ?? "",
  };

  const productsSortType = mapSortToProductsSortType(filters.sort);
  if (productsSortType) {
    query.productsSortType = productsSortType;
  }

  if (!filters.manufacturerCategoriesId) {
    delete query.manufacturerCategoriesId;
  }
  if (!filters.loaded) {
    delete query.loaded;
  }
  if (!filters.axis) {
    delete query.axis;
  }
  if (!filters.transmission) {
    delete query.transmission;
  }
  if (!filters.salesType) {
    delete query.salesType;
  }
  if (!filters.keyword) {
    delete query.keyword;
  }
  if (!filters.loadedLengthMin) {
    delete query.minLoadedInnerLength;
  }
  if (!filters.loadedLengthMax) {
    delete query.maxLoadedInnerLength;
  }

  return query;
};

/** filter-info / count API용 (웹 /products/count 와 동일 파라미터) */
export const buildProductFilterApiQuery = (
  filters: ProductSearchFilters,
): Record<string, string> => ({
  keyword: filters.keyword ?? "",
  manufacturerCategoriesId: filters.manufacturerCategoriesId ?? "",
  minYear: filters.yearMin,
  maxYear: filters.yearMax,
  minTons: filters.onlyOneTon ? "1" : filters.tonsMin,
  maxTons: filters.onlyOneTon ? "1.2" : filters.tonsMax,
  minDistance:
    filters.distanceMin !== ""
      ? String(Number(filters.distanceMin) * 10000)
      : "0",
  maxDistance:
    filters.distanceMax !== ""
      ? String(Number(filters.distanceMax) * 10000)
      : "",
  axis: filters.axis ?? "",
  transmission:
    filters.transmission === "BOTH" ? "" : (filters.transmission ?? ""),
  loaded: filters.loaded ?? "",
  minLoadedInnerLength: filters.loadedLengthMin ?? "",
  maxLoadedInnerLength: filters.loadedLengthMax ?? "",
  salesType: filters.salesType ?? "",
  area1: "",
  area2: "",
  area3: "",
});

export const parseProductCountResponse = (payload: unknown): number => {
  if (typeof payload === "number" && Number.isFinite(payload)) return payload;
  if (typeof payload === "string") {
    const parsed = Number(payload);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (data !== undefined) return parseProductCountResponse(data);
  }
  return 0;
};

export const formatFilterRadioLabel = (
  label: string,
  count?: number,
): string => {
  if (count === undefined || !Number.isFinite(count)) return label;
  return `${label}(${count.toLocaleString("ko-KR")})`;
};

/** filter-info 의 axis/transmission count 는 현재 필터를 반영하지 않아 count API 로 보정 */
export async function enrichRadioFacetOptionCounts(
  filters: ProductSearchFilters,
  options: FilterOptionItem[],
  field: "axis" | "transmission",
  fetchCount: (query: Record<string, string>) => Promise<unknown>,
): Promise<FilterOptionItem[]> {
  if (options.length === 0) return options;

  return Promise.all(
    options.map(async (option) => {
      try {
        const facetFilters: ProductSearchFilters = { ...filters };
        if (field === "axis") {
          facetFilters.axis = option.code;
        } else {
          facetFilters.transmission =
            option.code === "BOTH" ? undefined : option.code;
        }
        const payload = await fetchCount(
          buildProductFilterApiQuery(facetFilters),
        );
        return {
          ...option,
          count: parseProductCountResponse(payload),
        };
      } catch {
        return option;
      }
    }),
  );
}

export const clampNumber = (
  value: string,
  min: number,
  max: number,
  fallback: number,
) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(fallback);
  return String(Math.min(max, Math.max(min, parsed)));
};
