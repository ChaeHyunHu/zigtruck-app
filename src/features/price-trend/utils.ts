import type { ProductDetail } from "@/src/features/products/types";
import { enumCode, enumDesc } from "@/src/features/products/utils";

import type { PriceTrendOriginData, ProductSearchParams } from "./types";

export const defaultProductSearchParams = (): ProductSearchParams => ({
  tons: "",
  year: "",
  model: { id: 0, name: "" },
  manufacturerCategories: { id: 0, name: "", code: "" },
  loaded: { code: "", desc: "" },
  loadedInnerLength: "",
  loadedInnerArea: "",
  loadedInnerHeight: "",
  transmission: "",
  distance: "",
  fuel: "",
  power: "",
  axis: { code: "", desc: "" },
  productId: null,
  status: null,
});

const mapTransmissionDesc = (code?: string, desc?: string) => {
  if (desc) return desc;
  if (code === "AUTO") return "오토";
  if (code === "STICK" || code === "MANUAL") return "스틱";
  return "";
};

const mapFuelDesc = (code?: string, desc?: string) => {
  if (desc) return desc;
  if (code === "DIESEL") return "디젤";
  if (code === "LPG") return "LPG";
  if (code === "ELECTRIC" || code === "ELECT") return "전기";
  if (code === "GASOLINE" || code === "GAS") return "가솔린";
  return "";
};

export const mapOriginDataToSearchParams = (
  origin: PriceTrendOriginData,
): ProductSearchParams => {
  const year =
    origin.year?.toString() ||
    origin.firstRegistrationDate?.split("-")?.[0] ||
    origin.firstRegistrationDate?.slice(0, 4) ||
    "";

  const tons = origin.tons != null ? String(origin.tons) : "";
  const isUnderFourTons = Number(tons) > 0 && Number(tons) < 4;

  return {
    ...defaultProductSearchParams(),
    year,
    manufacturerCategories: origin.manufacturerCategories
      ? {
          id: origin.manufacturerCategories.id,
          name: origin.manufacturerCategories.name,
          code: origin.manufacturerCategories.code,
        }
      : { id: 0, name: "", code: "" },
    model: origin.model ? { id: origin.model.id, name: origin.model.name } : { id: 0, name: "" },
    tons,
    loaded: origin.loaded
      ? { code: origin.loaded.code ?? "", desc: origin.loaded.desc ?? "" }
      : { code: "", desc: "" },
    loadedInnerLength: origin.loadedInnerLength != null ? String(origin.loadedInnerLength) : "",
    loadedInnerArea: origin.loadedInnerArea != null ? String(origin.loadedInnerArea) : "",
    loadedInnerHeight: origin.loadedInnerHeight != null ? String(origin.loadedInnerHeight) : "",
    transmission: mapTransmissionDesc(
      typeof origin.transmission === "object" ? origin.transmission?.code : undefined,
      typeof origin.transmission === "object" ? origin.transmission?.desc : String(origin.transmission ?? ""),
    ),
    distance: origin.distance != null ? String(origin.distance) : "",
    fuel: mapFuelDesc(
      typeof origin.fuel === "object" ? origin.fuel?.code : undefined,
      typeof origin.fuel === "object" ? origin.fuel?.desc : String(origin.fuel ?? ""),
    ),
    power: origin.power != null ? String(origin.power) : "",
    axis: isUnderFourTons
      ? { code: "NONE", desc: "없음" }
      : origin.axis
        ? { code: origin.axis.code ?? "", desc: origin.axis.desc ?? "" }
        : { code: "", desc: "" },
    productId: origin.id ?? null,
    status: origin.status ?? null,
  };
};

export const buildPriceSearchParamsFromProductDetail = (
  detail: ProductDetail,
): ProductSearchParams => {
  const year = detail.firstRegistrationDate?.match(/\d{4}/)?.[0] ?? "";
  const tons = detail.tons != null ? String(detail.tons) : "";
  const isUnderFourTons = Number(tons) > 0 && Number(tons) < 4;

  const manufacturerCategories = detail.manufacturerCategories ?? {
    id: 0,
    name:
      typeof detail.manufacturer === "object" && detail.manufacturer !== null
        ? String(
            (detail.manufacturer as { name?: string }).name ??
              enumDesc(detail.manufacturer) ??
              "",
          )
        : (enumDesc(detail.manufacturer) ?? ""),
    code:
      typeof detail.manufacturer === "object" && detail.manufacturer !== null
        ? (detail.manufacturer as { code?: string }).code
        : undefined,
  };

  const model = detail.priceTrendModel ?? {
    id: 0,
    name:
      typeof detail.model === "string"
        ? detail.model
        : (enumDesc(detail.model as { desc?: string; code?: string }) ?? ""),
  };

  const loaded = detail.priceTrendLoaded
    ? {
        code: detail.priceTrendLoaded.code ?? "",
        desc: detail.priceTrendLoaded.desc ?? "",
      }
    : {
        code: enumCode(detail.loadedType) ?? "",
        desc: enumDesc(detail.loadedType) ?? "",
      };

  const axis =
    detail.axis && typeof detail.axis === "object"
      ? { code: enumCode(detail.axis) ?? "", desc: enumDesc(detail.axis) ?? "" }
      : { code: "", desc: "" };

  return {
    ...defaultProductSearchParams(),
    tons,
    year,
    manufacturerCategories,
    model,
    loaded,
    loadedInnerLength:
      detail.loadedInnerLength != null ? String(detail.loadedInnerLength) : "",
    loadedInnerArea:
      detail.loadedInnerArea != null ? String(detail.loadedInnerArea) : "",
    loadedInnerHeight:
      detail.loadedInnerHeight != null ? String(detail.loadedInnerHeight) : "",
    transmission: enumDesc(detail.transmission) ?? "",
    distance: detail.distance != null ? String(detail.distance) : "",
    fuel: enumDesc(detail.fuel) ?? "",
    power: detail.power != null ? String(detail.power) : "",
    axis: isUnderFourTons ? { code: "NONE", desc: "없음" } : axis,
    productId: detail.id,
    status: detail.status
      ? {
          code: detail.status.code ?? "",
          desc: detail.status.desc ?? "",
        }
      : null,
  };
};

export const buildPriceTrendQueryParams = (
  params: ProductSearchParams,
  options?: { price?: number | string | null },
) => {
  const query: Record<string, string> = {};
  const assign = (key: string, value?: string | number | null) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      query[key] = String(value);
    }
  };

  assign("tons", params.tons);
  assign("year", params.year);
  assign("transmission", params.transmission);
  assign("distance", params.distance);
  assign("fuel", params.fuel);
  assign("power", params.power);
  assign("loadedInnerLength", params.loadedInnerLength);
  assign("loadedInnerArea", params.loadedInnerArea);
  assign("loadedInnerHeight", params.loadedInnerHeight);
  assign("id", params.model?.id);
  assign("manufacturer", params.manufacturerCategories?.name);
  assign("modelName", params.model?.name);
  assign("loaded", params.loaded?.desc);
  assign("axis", params.axis?.desc);
  if (params.productId) assign("productId", params.productId);
  if (options?.price != null && String(options.price).length > 0) {
    assign("price", options.price);
  }

  return query;
};

export const getCurrentYear = () => new Date().getFullYear();
