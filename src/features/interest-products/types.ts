import type { EnumValue } from "@/src/features/products/types";

export type InterestProductItem = {
  id: number;
  productId: number;
  productsNumber?: number | string;
  truckName: string;
  firstRegistrationDate?: string;
  power?: number | string;
  representImageUrl?: string;
  price?: number | string;
  status?: EnumValue;
  salesType?: EnumValue;
  loaded?: EnumValue;
  safetyNumber?: string;
  salesPeople?: {
    phoneNumber?: string;
    safetyNumber?: string;
  };
  isNotificationEnabled?: boolean;
  year?: string;
  tons?: number;
  loadedInnerLength?: number;
  axis?: EnumValue;
  manufacturerCategoriesId?: number;
  distance?: string | number;
  transmission?: EnumValue;
};
