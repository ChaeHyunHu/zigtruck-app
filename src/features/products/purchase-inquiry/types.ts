export type ProductPurchaseInquiryFormState = {
  name: string;
  requestPhoneNumber: string;
  loadedCode: string;
  minLoadedInnerLength: string;
  maxLoadedInnerLength: string;
  minTons: string;
  maxTons: string;
  minYear: string;
  maxYear: string;
  minDistance: string;
  maxDistance: string;
  axisCode: string;
  transmissionCode: string;
  manufacturerIds: string[];
};

export type ProductPurchasingInquiryRequest = {
  memberId?: number;
  name: string;
  requestPhoneNumber: string;
  axis?: string | null;
  loaded?: string | null;
  maxDistance?: number | null;
  maxLoadedInnerLength?: number | null;
  maxTons?: number | null;
  maxYear?: number | null;
  minDistance?: number | null;
  minLoadedInnerLength?: number | null;
  manufacturerCategoriesId?: string | null;
  minTons?: number | null;
  minYear?: number | null;
  transmission?: string | null;
};
