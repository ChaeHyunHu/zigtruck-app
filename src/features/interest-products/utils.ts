import {
  MAINTENANCE_SALE,
  PRODUCT_STATUS_SALE,
  SALES_TYPE_ASSURANCE,
  SALES_TYPE_CONSIGNMENT,
  SALES_TYPE_NORMAL,
} from "@/src/constants/products";
import { pickArray } from "@/src/utils/pickArray";
import type { EnumValue } from "@/src/features/products/types";

import type { InterestProductItem } from "./types";

export function normalizeInterestProducts(payload: unknown): InterestProductItem[] {
  return pickArray(payload)
    .map((raw) => normalizeInterestProduct(raw as Record<string, unknown>))
    .filter((item): item is InterestProductItem => Boolean(item.id));
}

export function normalizeInterestProduct(raw: Record<string, unknown>): InterestProductItem {
  const id = Number(raw.id);
  const productId = Number(raw.productId ?? raw.productsId);
  return {
    id,
    productId,
    productsNumber: raw.productsNumber as number | string | undefined,
    truckName: String(raw.truckName ?? raw.title ?? ""),
    firstRegistrationDate:
      typeof raw.firstRegistrationDate === "string"
        ? raw.firstRegistrationDate
        : raw.year != null
          ? String(raw.year)
          : undefined,
    power: raw.power as number | string | undefined,
    representImageUrl: typeof raw.representImageUrl === "string" ? raw.representImageUrl : undefined,
    price: (raw.price as number | string | undefined) ?? undefined,
    status: raw.status as EnumValue | undefined,
    salesType: raw.salesType as EnumValue | undefined,
    loaded: raw.loaded as EnumValue | undefined,
    safetyNumber: typeof raw.safetyNumber === "string" ? raw.safetyNumber : undefined,
    salesPeople: raw.salesPeople as InterestProductItem["salesPeople"],
    isNotificationEnabled:
      typeof raw.isNotificationEnabled === "boolean" ? raw.isNotificationEnabled : true,
    year: raw.year != null ? String(raw.year) : undefined,
    tons: typeof raw.tons === "number" ? raw.tons : Number(raw.tons) || undefined,
    loadedInnerLength:
      typeof raw.loadedInnerLength === "number"
        ? raw.loadedInnerLength
        : Number(raw.loadedInnerLength) || undefined,
    axis: raw.axis as EnumValue | undefined,
    manufacturerCategoriesId:
      typeof raw.manufacturerCategoriesId === "number"
        ? raw.manufacturerCategoriesId
        : undefined,
    distance: raw.distance as string | number | undefined,
    transmission: raw.transmission as EnumValue | undefined,
  };
}

export function getSalesTypeLabel(code?: string): string | undefined {
  switch (code) {
    case SALES_TYPE_NORMAL:
      return "직거래";
    case SALES_TYPE_CONSIGNMENT:
      return "위탁판매";
    case SALES_TYPE_ASSURANCE:
      return "직트럭 상품용";
    default:
      return undefined;
  }
}

export function isOnSale(statusCode?: string) {
  return statusCode === PRODUCT_STATUS_SALE || statusCode === MAINTENANCE_SALE;
}

export function enumCode(value?: EnumValue | string) {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value.code;
}
