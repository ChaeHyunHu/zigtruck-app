import {
  FILTER_DISTANCE_MAX,
  FILTER_DISTANCE_MIN,
  FILTER_TONS_MAX,
  FILTER_TONS_MIN,
  FILTER_YEAR_MAX,
  FILTER_YEAR_MIN,
} from "@/src/features/products/filterConstants";
import type { ProductSearchFilters } from "@/src/features/products/filterTypes";
import type {
  ProductPurchaseInquiryFormState,
  ProductPurchasingInquiryRequest,
} from "@/src/features/products/purchase-inquiry/types";

export function formStateFromFilters(
  filters?: Partial<ProductSearchFilters>,
  profile?: { name?: string; phoneNumber?: string },
): ProductPurchaseInquiryFormState {
  const defaults = {
    minTons: String(FILTER_TONS_MIN),
    maxTons: String(FILTER_TONS_MAX),
    minYear: String(FILTER_YEAR_MIN),
    maxYear: String(FILTER_YEAR_MAX),
    minDistance: String(FILTER_DISTANCE_MIN),
    maxDistance: String(FILTER_DISTANCE_MAX),
  };

  return {
    name: profile?.name ?? "",
    requestPhoneNumber: profile?.phoneNumber ?? "",
    loadedCode: filters?.loaded ?? "",
    minLoadedInnerLength: filters?.loadedLengthMin ?? "",
    maxLoadedInnerLength: filters?.loadedLengthMax ?? "",
    minTons: filters?.tonsMin ?? defaults.minTons,
    maxTons: filters?.tonsMax ?? defaults.maxTons,
    minYear: filters?.yearMin ?? defaults.minYear,
    maxYear: filters?.yearMax ?? defaults.maxYear,
    minDistance: filters?.distanceMin ?? defaults.minDistance,
    maxDistance: filters?.distanceMax ?? defaults.maxDistance,
    axisCode: filters?.axis ?? "",
    transmissionCode: filters?.transmission ?? "",
    manufacturerIds: filters?.manufacturerCategoriesId
      ? [filters.manufacturerCategoriesId]
      : [],
  };
}

export function buildProductPurchasingInquiryRequest(
  form: ProductPurchaseInquiryFormState,
  memberId?: number,
): ProductPurchasingInquiryRequest {
  const request: ProductPurchasingInquiryRequest = {
    memberId,
    name: form.name.trim(),
    requestPhoneNumber: form.requestPhoneNumber.trim(),
    axis: form.axisCode || null,
    loaded: form.loadedCode || null,
    maxDistance: form.maxDistance ? Number(form.maxDistance) : null,
    maxLoadedInnerLength: form.maxLoadedInnerLength
      ? Number(form.maxLoadedInnerLength)
      : null,
    maxTons: form.maxTons ? Number(form.maxTons) : null,
    maxYear: form.maxYear ? Number(form.maxYear) : null,
    minDistance: form.minDistance ? Number(form.minDistance) : null,
    minLoadedInnerLength: form.minLoadedInnerLength
      ? Number(form.minLoadedInnerLength)
      : null,
    manufacturerCategoriesId: form.manufacturerIds.length
      ? form.manufacturerIds.join(",")
      : null,
    minTons: form.minTons ? Number(form.minTons) : null,
    minYear: form.minYear ? Number(form.minYear) : null,
    transmission: form.transmissionCode || null,
  };

  if (request.minDistance === 0 && request.maxDistance === 200) {
    request.minDistance = null;
    request.maxDistance = null;
  }

  return request;
}

export function buildInterestNotificationFromPurchaseInquiry(
  form: ProductPurchaseInquiryFormState,
): Record<string, unknown> {
  const request: Record<string, unknown> = {
    loaded: form.loadedCode || null,
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

  if (request.minDistance === 0 && request.maxDistance === 200) {
    request.minDistance = null;
    request.maxDistance = null;
  }

  return request;
}

export function canSubmitPurchaseInquiry(form: ProductPurchaseInquiryFormState): boolean {
  return Boolean(
    form.name.trim() &&
      form.requestPhoneNumber.trim() &&
      form.loadedCode &&
      form.minTons &&
      form.maxTons &&
      form.minLoadedInnerLength &&
      form.maxLoadedInnerLength,
  );
}
