import {
  PRODUCT_STATUS_BEFORE_SALE,
} from "@/src/constants/products";

import type { RegistrationProduct } from "./types";

export const REGISTRATION_STEPS = [
  "model",
  "tons",
  "loaded",
  "axis",
  "additional-info",
  "price-trend",
  "detail-info",
  "photo",
  "price",
] as const;

export type RegistrationStep = (typeof REGISTRATION_STEPS)[number];

export const getStepIndex = (step: RegistrationStep) =>
  REGISTRATION_STEPS.indexOf(step) + 1;

export const getPageName = (data: RegistrationProduct): RegistrationStep => {
  if (data.status?.code === PRODUCT_STATUS_BEFORE_SALE) {
    if (!data.model?.id && !data.model?.name) return "model";
    if (!data.tons) return "tons";
    if (!data.loaded?.code || !data.loadedInnerLength) return "loaded";
    if (!data.axis?.code) return "axis";
    if (!data.transmission || !data.distance || !data.fuel || !data.power) {
      return "additional-info";
    }
    const img = data.productsImage;
    if (
      !img?.frontSideImageUrl ||
      !img?.backSideImageUrl ||
      !img?.frontImageUrl
    ) {
      return "photo";
    }
    if (!data.price) return "price";
  }
  return "price";
};

export const isLengthOnlyLoadedType = (data: RegistrationProduct) => {
  const validCodes = ["CARGO", "TANKLORRY", "TRAILER", "LADDER", "AUTOLADDER", "TONGS"];
  return validCodes.includes(String(data?.loaded?.code ?? ""));
};

export const isUnderFourTons = (tons?: number | string) => {
  const n = Number(tons);
  return Number.isFinite(n) && n < 4;
};

export const normalizeCarRegisterResponse = (
  data: RegistrationProduct,
): RegistrationProduct => {
  if (data.manufacturerCategories?.code === "ETC") {
    return { ...data, model: { id: 45, name: "기타(쌍용 외)" } };
  }
  return data;
};

export const registrationPath = (step: RegistrationStep, id: number | string) =>
  `/products/sales/${step}/${id}` as const;

/** 판매 등록 시세 화면 등에 표시할 차량 요약 문구 */
export const formatRegistrationTruckTitle = (
  data: RegistrationProduct | null | undefined,
): string => {
  if (!data) return "";
  if (data.truckName?.trim()) return data.truckName.trim();

  const year =
    data.year != null
      ? String(data.year)
      : data.firstRegistrationDate?.match(/\d{4}/)?.[0] ?? "";
  const manufacturer = data.manufacturerCategories?.name ?? "";
  const model = data.model?.name ?? "";
  const tons = data.tons != null && data.tons !== "" ? `${data.tons}톤` : "";
  const loaded = data.loaded?.desc ?? "";

  return [year ? `${year}년` : "", manufacturer, model, tons, loaded]
    .filter(Boolean)
    .join(" ")
    .trim();
};
