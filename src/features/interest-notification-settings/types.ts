import type { EnumPresenter } from "@/src/features/notifications/types";

export type ManufacturerCategory = {
  id?: number;
  code?: string;
  name?: string;
};

export type InterestNotificationSettingItem = {
  id: number;
  minYear?: number | null;
  maxYear?: number | null;
  minTons?: number | null;
  maxTons?: number | null;
  minLoadedInnerLength?: number | null;
  maxLoadedInnerLength?: number | null;
  minDistance?: number | null;
  maxDistance?: number | null;
  loaded?: EnumPresenter[] | null;
  axis?: EnumPresenter | null;
  transmission?: EnumPresenter | null;
  manufacturerCategories?: ManufacturerCategory[] | null;
};

export type InterestNotificationFormState = {
  loadedCodes: string[];
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
