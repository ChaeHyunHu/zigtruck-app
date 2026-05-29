import {
  buildImagePatchPayload,
  type ProductImagesState,
} from "@/src/features/products/ProductPhotoEditor";
import type { ProductDetail } from "@/src/features/products/types";
import { enumCode, enumDesc } from "@/src/features/products/utils";
import type { RegistrationProduct } from "@/src/features/sell-car/registration/types";
import { isOneTonRange } from "@/src/features/products/edit/utils";
import { isUnderFourTons } from "@/src/features/sell-car/registration/productUtils";

function toFormString(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

function toEnumField(
  value?: { code?: string; desc?: string } | string | null,
): { code: string; desc: string } | undefined {
  if (!value) return undefined;
  if (typeof value === "object" && value.code) {
    return { code: String(value.code), desc: String(value.desc ?? value.code) };
  }
  const desc = typeof value === "string" ? value : "";
  return desc ? { code: desc, desc } : undefined;
}

function mapCarOptionFromRaw(raw: Record<string, unknown>) {
  const carOption = (raw.carOption ?? {}) as Record<string, unknown>;
  const mapGroup = (group: unknown) => {
    if (!group || typeof group !== "object") {
      return { etc: "", option: [] as { code?: string; desc?: string }[] };
    }
    const g = group as Record<string, unknown>;
    const option = Array.isArray(g.option)
      ? (g.option as Array<{ code?: string; desc?: string }>)
      : [];
    return { etc: String(g.etc ?? ""), option };
  };
  return {
    normalOption: mapGroup(carOption.normalOption),
    additionalOption: mapGroup(carOption.additionalOption),
    breakOption: mapGroup(carOption.breakOption ?? carOption.brakeOption),
  };
}

function mapMaintenanceFromRaw(raw: Record<string, unknown>) {
  const maintenance = (raw.maintenance ?? {}) as Record<string, unknown>;
  const maintenanceData = Array.isArray(maintenance.maintenanceData)
    ? (maintenance.maintenanceData as Array<{ code?: string; desc?: string }>)
    : [];
  return {
    maintenanceData,
    etc: String(maintenance.etc ?? ""),
  };
}

export function productDetailToEditForm(
  detail: ProductDetail,
  rawPayload?: unknown,
): RegistrationProduct {
  const raw =
    rawPayload && typeof rawPayload === "object"
      ? ((rawPayload as { data?: unknown }).data ?? rawPayload)
      : {};
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const manufacturerCategories =
    detail.manufacturerCategories ??
    (data.manufacturerCategories as RegistrationProduct["manufacturerCategories"]) ??
    (typeof detail.manufacturer === "object" && detail.manufacturer !== null
      ? {
          id: Number((detail.manufacturer as { id?: number }).id) || 0,
          name: enumDesc(detail.manufacturer) ?? "",
          code: enumCode(detail.manufacturer),
        }
      : {
          id: 0,
          name:
            typeof detail.manufacturer === "string"
              ? detail.manufacturer
              : enumDesc(detail.manufacturer) ?? "",
        });

  const modelRaw = data.model;
  const model =
    modelRaw && typeof modelRaw === "object" && modelRaw !== null
      ? {
          id: Number((modelRaw as { id?: number }).id) || 0,
          name: String(
            (modelRaw as { name?: string }).name ??
              (typeof detail.model === "string" ? detail.model : enumDesc(detail.model)) ??
              "",
          ),
        }
      : {
          id:
            typeof detail.model === "object" && detail.model !== null
              ? Number((detail.model as { id?: number }).id) || 0
              : 0,
          name:
            typeof detail.model === "string"
              ? detail.model
              : enumDesc(detail.model) ?? "",
        };

  const modelDetail =
    toEnumField(
      (data.modelDetail as { code?: string; desc?: string }) ??
        detail.subModel ??
        data.subModel,
    ) ?? undefined;

  const loaded = toEnumField(
    (data.loaded as { code?: string; desc?: string }) ?? detail.loadedType,
  );

  const loadedDetail = toEnumField(
    data.loadedDetail as { code?: string; desc?: string },
  );

  const accidentsHistory = (data.accidentsHistory ?? {}) as {
    accident?: boolean;
    accidentContents?: string;
  };

  return {
    id: detail.id,
    truckName: detail.truckName,
    truckNumber: detail.truckNumber ?? detail.vehicleNumber,
    status: detail.status,
    type: detail.type,
    salesType: detail.salesType,
    manufacturerCategories,
    model,
    modelDetail,
    tons: toFormString(detail.tons ?? data.tons),
    loaded,
    loadedDetail,
    loadedInnerLength: toFormString(
      detail.loadedInnerLength ?? data.loadedInnerLength,
    ),
    loadedInnerArea: toFormString(
      detail.loadedInnerArea ?? detail.loadedInnerWidth ?? data.loadedInnerArea,
    ),
    loadedInnerHeight: toFormString(
      detail.loadedInnerHeight ?? data.loadedInnerHeight,
    ),
    axis:
      toEnumField(detail.axis) ??
      (isUnderFourTons(detail.tons)
        ? { code: "NONE", desc: "없음" }
        : { code: "NONE", desc: "없음" }),
    transmission: toEnumField(detail.transmission),
    distance: toFormString(detail.distance ?? data.distance),
    fuel: toEnumField(detail.fuel),
    power:
      detail.power !== undefined && detail.power !== null
        ? String(detail.power)
        : String(data.power ?? ""),
    color: toEnumField(detail.color),
    garage:
      toEnumField(
        (data.garage as { code?: string; desc?: string }) ??
          (typeof detail.garage === "string"
            ? { code: detail.garage, desc: detail.garage }
            : detail.garage),
      ) ?? undefined,
    area1: String(data.area1 ?? ""),
    area2: String(data.area2 ?? ""),
    area3: String(data.area3 ?? ""),
    price: detail.price,
    productsImage: (detail.productsImage ?? data.productsImage) as RegistrationProduct["productsImage"],
    accident: Boolean(
      accidentsHistory.accident ?? detail.hasAccident ?? data.accident,
    ),
    accidentContents:
      accidentsHistory.accidentContents ?? detail.accidentContents ?? "",
    accidentsHistory: {
      accident: Boolean(
        accidentsHistory.accident ?? detail.hasAccident ?? data.accident,
      ),
      accidentContents:
        accidentsHistory.accidentContents ?? detail.accidentContents ?? "",
    },
    maintenance: mapMaintenanceFromRaw(data),
    carOption: mapCarOptionFromRaw(data),
    transportGoods: String(data.transportGoods ?? detail.transportGoods ?? ""),
    transportStartLocate: toEnumField(
      (data.transportStartLocate as { code?: string; desc?: string }) ??
        detail.transportStartLocate,
    ),
    transportEndLocate: toEnumField(
      (data.transportEndLocate as { code?: string; desc?: string }) ??
        detail.transportEndLocate,
    ),
    tireStatus: toEnumField(
      (data.tireStatus as { code?: string; desc?: string }) ?? detail.tireStatus,
    ),
    detailContent: detail.detailContent ?? detail.description ?? "",
  };
}

export function buildVehiclePatchPayload(
  form: RegistrationProduct,
): ProductRegisterRequest {
  const tons = form.tons;
  const isTonsOne = isOneTonRange(tons);

  return {
    id: form.id,
    modelId: form.model?.id,
    modelDetail: form.modelDetail?.code ?? "",
    tons: tons ? Number(tons) : undefined,
    loaded: form.loaded?.code,
    loadedDetail: form.loadedDetail?.code ?? "",
    loadedInnerLength: form.loadedInnerLength
      ? Number(form.loadedInnerLength)
      : undefined,
    loadedInnerArea: form.loadedInnerArea
      ? Number(form.loadedInnerArea)
      : undefined,
    loadedInnerHeight: form.loadedInnerHeight
      ? Number(form.loadedInnerHeight)
      : undefined,
    axis: isUnderFourTons(tons) ? "NONE" : form.axis?.code,
    transmission: form.transmission?.code,
    distance: form.distance ? Number(String(form.distance).replace(/,/g, "")) : undefined,
    fuel: form.fuel?.code,
    power: form.power ?? "",
    color: form.color?.code,
    garage: form.garage?.code,
    area1: isTonsOne ? form.area1 ?? "" : "",
    area2: isTonsOne ? form.area2 ?? "" : "",
    area3: isTonsOne ? form.area3 ?? "" : "",
  };
}

export function buildFullEditPatchPayload(
  form: RegistrationProduct,
  images: ProductImagesState,
  price: number,
): ProductRegisterRequest {
  return {
    ...buildVehiclePatchPayload(form),
    ...buildDetailPatchPayload(form),
    ...buildImagePatchPayload(images),
    price,
  };
}

export function buildDetailPatchPayload(
  form: RegistrationProduct,
): ProductRegisterRequest {
  const maintenanceData = {
    maintenanceCategories:
      form.maintenance?.maintenanceData?.map((item) => item.code) ?? [],
    etc: form.maintenance?.etc ?? "",
  };

  const carOption = {
    normalOption: {
      etc: form.carOption?.normalOption?.etc ?? "",
      option:
        form.carOption?.normalOption?.option?.map((item) => item.code) ?? [],
    },
    additionalOption: {
      etc: form.carOption?.additionalOption?.etc ?? "",
      option:
        form.carOption?.additionalOption?.option?.map((item) => item.code) ?? [],
    },
    breakOption: {
      etc: form.carOption?.breakOption?.etc ?? "",
      option: form.carOption?.breakOption?.option?.map((item) => item.code) ?? [],
    },
  };

  return {
    id: form.id,
    accident: form.accidentsHistory?.accident ?? form.accident ?? false,
    accidentContents:
      form.accidentsHistory?.accidentContents ?? form.accidentContents ?? "",
    maintenanceData,
    transportGoods: form.transportGoods,
    transportStartLocate: form.transportStartLocate?.code,
    transportEndLocate: form.transportEndLocate?.code,
    tireStatus: form.tireStatus?.code,
    carOption,
    detailContent: form.detailContent,
  };
}
