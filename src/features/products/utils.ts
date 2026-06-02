import { IMAGE_BASE_URL } from "@/src/constants/url";
import { resolveInterestedProductId } from "@/src/features/interest-products/resolveInterestedProductId";

export { pickArray } from "@/src/utils/pickArray";

import type {
  EnumValue,
  MaintenanceItem,
  ProductDetail,
  ProductDetailLicense,
  ProductImageItem,
  ProductListItem,
} from "./types";

export const resolveImageUri = (raw: any): string | undefined => {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const representative = raw.find(
      (item) => item?.isRepresentative || item?.representative,
    );
    return resolveImageUri(representative ?? raw[0]);
  }
  if (typeof raw === "object") {
    return resolveImageUri(
      raw?.frontSideImageUrl ??
        raw?.url ??
        raw?.imageUrl ??
        raw?.fileUrl ??
        raw?.path ??
        raw?.thumbnailUrl ??
        raw?.representImageUrl ??
        raw?.representativeImageUrl,
    );
  }
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `${IMAGE_BASE_URL}${value}`;
  return `${IMAGE_BASE_URL}/${value}`;
};

export const PRODUCT_IMAGE_FIELD_ORDER = [
  "frontSideImageUrl",
  "backSideImageUrl",
  "frontImageUrl",
  "backImageUrl",
  "tireImageUrl",
  "engineImageUrl",
  "insideImageUrl",
  "dashboardImageUrl",
  "sheetImageUrl",
] as const;

export const collectProductImageUrls = (
  productsImage?: Record<string, unknown> | null,
  fallbackSource?: Record<string, unknown> | null,
): string[] => {
  const source = {
    ...(fallbackSource ?? {}),
    ...(productsImage ?? {}),
  };
  if (!source || typeof source !== "object") return [];
  const list: string[] = [];
  for (const field of PRODUCT_IMAGE_FIELD_ORDER) {
    const uri = resolveImageUri(source[field]);
    if (uri) list.push(uri);
  }
  const options = source.optionImageUrl;
  if (Array.isArray(options)) {
    options.forEach((entry) => {
      const uri = resolveImageUri(entry);
      if (uri) list.push(uri);
    });
  }
  return list;
};

export const collectImageUris = (payload: any): string[] => {
  if (!payload) return [];
  const result: string[] = [];
  const push = (value: any) => {
    const uri = resolveImageUri(value);
    if (uri && !result.includes(uri)) result.push(uri);
  };

  const groups: any[] = [];
  if (Array.isArray(payload.productImages))
    groups.push(...payload.productImages);
  if (Array.isArray(payload.productsImages))
    groups.push(...payload.productsImages);
  if (Array.isArray(payload.images)) groups.push(...payload.images);
  if (payload.productsImage) groups.push(payload.productsImage);
  if (payload.representImageUrl) groups.push(payload.representImageUrl);

  groups.forEach((group) => push(group));
  return result;
};

export const collectListItemImageUrls = (item: any): string[] => {
  const result: string[] = [];
  const pushUnique = (value: unknown) => {
    const uri = resolveImageUri(value);
    if (uri && !result.includes(uri)) result.push(uri);
  };

  pushUnique(
    item?.representImageUrl ?? item?.frontImageUrl ?? item?.thumbnailImageUrl,
  );

  collectProductImageUrls(item?.productsImage, item).forEach((uri) => {
    if (!result.includes(uri)) result.push(uri);
  });

  if (result.length === 0) {
    collectImageUris(item).forEach((uri) => {
      if (!result.includes(uri)) result.push(uri);
    });
  }

  return result;
};

export const enumDesc = (value?: EnumValue | string): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  // 제조사(manufacturerCategories) 등은 desc 없이 name만 내려오므로 name을 우선 사용
  return value.desc ?? value.name ?? value.code;
};

export const enumCode = (value?: EnumValue | string): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value.code;
};

export const toText = (value: unknown, fallback = ""): string => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (typeof value === "object") {
    const anyValue = value as Record<string, unknown>;
    const candidate =
      anyValue.desc ?? anyValue.code ?? anyValue.label ?? anyValue.name;
    if (typeof candidate === "string") return candidate;
    if (typeof candidate === "number") return String(candidate);
    return fallback;
  }
  return fallback;
};

const pickString = (value: unknown): string | undefined => {
  const result = toText(value);
  return result.length > 0 ? result : undefined;
};

export const formatYearMonth = (date?: string): string => {
  if (!date) return "-";
  const match = date.match(/^(\d{4})-(\d{2})/);
  if (match) return `${match[1]}.${match[2]}`;
  return date;
};

export const formatDistanceManKm = (distance?: number | null): string => {
  if (distance === undefined || distance === null) return "-";
  const value = Math.floor(distance / 10000);
  return `${value}만km`;
};

export const formatLoadedLength = (value?: number | string): string => {
  if (value === undefined || value === null || value === "") return "-";
  return `${value}m`;
};

export const hasLoadedSpecValue = (value?: number | string | null) => {
  if (value === undefined || value === null) return false;
  const text = String(value).trim();
  if (!text) return false;
  const numeric = Number(text);
  if (Number.isFinite(numeric) && numeric === 0) return false;
  return true;
};

export const hasDisplayValue = (value?: string | number | null) => {
  if (value === undefined || value === null) return false;
  return String(value).trim() !== "";
};

export const formatPower = (value?: number | string): string => {
  if (value === undefined || value === null || value === "") return "-";
  return `${value}`;
};

export const formatDistanceKm = (value?: number | null): string => {
  if (value === undefined || value === null) return "-";
  return `${new Intl.NumberFormat("ko-KR").format(value)}km`;
};

export const formatYearMonthKorean = (date?: string): string => {
  if (!date) return "-";
  const match = date.match(/^(\d{4})-(\d{2})/);
  if (!match) return date;
  const year = match[1].slice(-2);
  const month = match[2];
  return `${year}년 ${month}월`;
};

export const formatDateDot = (date?: string): string => {
  if (!date) return "-";
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return date;
  return `${match[1]}.${match[2]}.${match[3]}`;
};

export const formatTons = (value?: number | string): string => {
  if (value === undefined || value === null || value === "") return "-";
  return `${value}t`;
};

export const formatPalletCount = (value?: number | string): string => {
  if (value === undefined || value === null || value === "") return "-";
  return `${value}개`;
};

export const formatCount = (value?: number): string => {
  if (value === undefined || value === null) return "없음";
  if (value === 0) return "없음";
  return `${value}건`;
};

export const formatPowerPs = (value?: number | string): string => {
  if (value === undefined || value === null || value === "") return "-";
  return `${value}ps`;
};

export const formatViewCount = (value?: number) => {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat("ko-KR").format(value);
};

const matchOwnerId = (payload: any): number | undefined => {
  return (
    payload?.memberId ??
    payload?.ownerId ??
    payload?.member?.id ??
    payload?.owner?.id ??
    payload?.seller?.id ??
    undefined
  );
};

export const normalizeListItem = (item: any): ProductListItem | null => {
  const id = item?.id ?? item?.productId ?? item?.productsId;
  if (id === undefined || id === null) return null;
  // 1톤~1.2톤 차량 활동지: area1(시/도) + area2(시/군/구)를 "경기도(수원시,용인시)" 형식으로 표기
  const area1 = pickString(item?.area1);
  const area2 = pickString(item?.area2);
  const region =
    area1 && area2
      ? `${area1}(${area2})`
      : pickString(
          item?.region ??
            area1 ??
            item?.area ??
            item?.location ??
            [item?.area1, item?.area2, item?.area3]
              .filter((part) => typeof part === "string" && part.length > 0)
              .join(" "),
        );
  const imageUrls = collectListItemImageUrls(item);
  const representImageUrl =
    resolveImageUri(
      item?.representImageUrl ?? item?.frontImageUrl ?? item?.thumbnailImageUrl,
    ) ?? imageUrls[0];

  return {
    id: Number(id),
    productsNumber: pickString(item?.productsNumber ?? item?.productNumber),
    representImageUrl,
    imageUrls,
    truckName: pickString(item?.truckName ?? item?.title),
    truckNumber: pickString(
      item?.truckNumber ??
        item?.vehicleNumber ??
        item?.plateNumber ??
        item?.carNumber,
    ),
    firstRegistrationDate: pickString(
      item?.firstRegistrationDate ??
        item?.firstRegisterDate ??
        item?.registerDate,
    ),
    distance:
      typeof item?.distance === "number"
        ? item.distance
        : Number(item?.distance ?? item?.mileage) || undefined,
    loadedInnerLength: pickString(item?.loadedInnerLength ?? item?.length),
    power: pickString(item?.power ?? item?.horsePower),
    palletCount: pickString(item?.palletCount ?? item?.pallet),
    region,
    location: pickString(item?.location ?? item?.region ?? item?.area1),
    transmission: item?.transmission ?? item?.gearbox,
    fuel: item?.fuel,
    price:
      typeof item?.price === "number"
        ? item.price
        : typeof item?.salePrice === "number"
          ? item.salePrice
          : (item?.price ?? item?.salePrice ?? null),
    salesType: item?.salesType,
    status: item?.status ?? item?.productStatus,
    isLicense: typeof item?.isLicense === "number" ? item.isLicense : undefined,
    youtubeUrl: pickString(item?.youtubeUrl),
  };
};

const normalizeProductLicense = (raw: unknown): ProductDetailLicense | null => {
  if (raw == null || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  return {
    id: data.id != null ? Number(data.id) : undefined,
    licenseType: data.licenseType as EnumValue | undefined,
    licenseSalesType: data.licenseSalesType as EnumValue | undefined,
    status: data.status as EnumValue | undefined,
    price: (data.price as string | number | null | undefined) ?? null,
    tons: data.tons as number | string | null | undefined,
    maxTons: data.maxTons as number | string | null | undefined,
    locate: data.locate as EnumValue | undefined,
    year: typeof data.year === "number" ? data.year : undefined,
    useClassification: data.useClassification as EnumValue | undefined,
    licenseCounselStatus: data.licenseCounselStatus as EnumValue | undefined,
  };
};

export const normalizeDetail = (
  payload: any,
  currentMemberId?: number,
): ProductDetail | null => {
  if (!payload) return null;
  const data = payload?.data ?? payload;
  const id = data?.id ?? data?.productId ?? data?.productsId;
  if (id === undefined || id === null) return null;

  const ownerId = matchOwnerId(data);
  const orderedImageUrls = collectProductImageUrls(data?.productsImage, data);
  const imageUrls =
    orderedImageUrls.length > 0
      ? orderedImageUrls
      : [resolveImageUri(data?.representImageUrl)].filter(
          (uri): uri is string => Boolean(uri),
        );
  const collectedImages: ProductImageItem[] = imageUrls.map((imageUrl) => ({
    imageUrl,
  }));

  const optionListBy = (...keys: string[]): string[] | undefined => {
    for (const key of keys) {
      const value = (data as any)?.[key];
      const arr = Array.isArray(value)
        ? value
        : Array.isArray(value?.option)
          ? value.option
          : null;
      if (arr && arr.length > 0) {
        return (arr as any[])
          .map((entry) =>
            typeof entry === "string"
              ? entry
              : (entry?.desc ?? entry?.label ?? entry?.name ?? entry?.code),
          )
          .filter(
            (entry: unknown): entry is string =>
              typeof entry === "string" && entry.length > 0,
          );
      }
    }
    return undefined;
  };

  const carOption = data?.carOption ?? {};
  const mainOptionsFromCarOption = Array.isArray(
    carOption?.normalOption?.option,
  )
    ? (carOption.normalOption.option as any[])
        .map((entry) => entry?.desc ?? entry?.code)
        .filter(
          (entry): entry is string =>
            typeof entry === "string" && entry.length > 0,
        )
    : undefined;
  const additionalOptionsFromCarOption = Array.isArray(
    carOption?.additionalOption?.option,
  )
    ? (carOption.additionalOption.option as any[])
        .map((entry) => entry?.desc ?? entry?.code)
        .filter(
          (entry): entry is string =>
            typeof entry === "string" && entry.length > 0,
        )
    : undefined;
  const brakeOptionsFromCarOption = Array.isArray(
    carOption?.breakOption?.option ?? carOption?.brakeOption?.option,
  )
    ? (
        (carOption.breakOption?.option ??
          carOption.brakeOption?.option) as any[]
      )
        .map((entry) => entry?.desc ?? entry?.code)
        .filter(
          (entry): entry is string =>
            typeof entry === "string" && entry.length > 0,
        )
    : undefined;

  const accidentsHistory = data?.accidentsHistory;
  const accidentContents = pickString(
    (typeof accidentsHistory === "object" &&
    accidentsHistory !== null &&
    !Array.isArray(accidentsHistory)
      ? accidentsHistory.accidentContents
      : undefined) ?? data?.accidentContents,
  );
  const hasAccident = Boolean(
    accidentContents ||
    (typeof accidentsHistory === "object" &&
      accidentsHistory !== null &&
      !Array.isArray(accidentsHistory) &&
      accidentsHistory.accident === true) ||
    data?.accident === true,
  );

  const maintenance = data?.maintenance;
  const maintenanceData = Array.isArray(maintenance?.maintenanceData)
    ? (maintenance.maintenanceData as any[])
        .map((entry) => entry?.desc ?? entry?.code ?? entry?.name)
        .filter(
          (entry): entry is string =>
            typeof entry === "string" && entry.length > 0,
        )
    : undefined;
  const maintenanceEtc = pickString(maintenance?.etc);

  const maintenanceHistorySource =
    data?.maintenanceHistory ?? data?.maintenances;
  const maintenanceHistory: MaintenanceItem[] | undefined = Array.isArray(
    maintenanceHistorySource,
  )
    ? maintenanceHistorySource.map((entry: any) => ({
        id: entry?.id,
        title:
          entry?.title ??
          entry?.partName ??
          entry?.name ??
          entry?.content ??
          entry?.contents,
        date: entry?.date ?? entry?.repairedAt ?? entry?.maintainedAt,
        description: entry?.description ?? entry?.detail ?? entry?.contents,
      }))
    : undefined;

  return {
    id: Number(id),
    productsNumber: data?.productsNumber ?? data?.productNumber,
    truckName: pickString(data?.truckName ?? data?.title),
    truckNumber: pickString(
      data?.truckNumber ??
        data?.vehicleNumber ??
        data?.plateNumber ??
        data?.carNumber,
    ),
    vehicleNumber: pickString(data?.vehicleNumber),
    price: data?.price ?? data?.salePrice ?? null,
    status: data?.status,
    type: data?.type,
    salesType: data?.salesType,
    manufacturer:
      data?.manufacturer ??
      data?.manufacturerName ??
      data?.manufacturerCategories,
    model: pickString(data?.modelName ?? data?.model?.name ?? data?.model),
    subModel: data?.subModel ?? data?.detailModel ?? data?.modelDetail,
    vehicleType: data?.vehicleType ?? data?.carType,
    axis: data?.axis ?? data?.axleType,
    transmission: data?.transmission ?? data?.gearbox,
    fuel: data?.fuel,
    loadedType: data?.loadedType ?? data?.loaded ?? data?.cargoType,
    color: data?.color ?? data?.vehicleColor,
    firstRegistrationDate: pickString(
      data?.firstRegistrationDate ??
        data?.firstRegisterDate ??
        data?.registerDate,
    ),
    modelYear: pickString(
      data?.year ?? data?.modelYear ?? data?.formYear ?? data?.styleYear,
    ),
    distance:
      typeof data?.distance === "number"
        ? data.distance
        : Number(data?.distance ?? data?.mileage) || undefined,
    power:
      typeof data?.power === "number"
        ? data.power
        : Number(data?.power ?? data?.horsePower) || undefined,
    tons: pickString(data?.tons ?? data?.tonnage ?? data?.weight),
    loadedInnerLength: pickString(data?.loadedInnerLength ?? data?.length),
    loadedInnerArea: pickString(
      data?.loadedInnerArea ?? data?.loadedInnerWidth ?? data?.width,
    ),
    loadedInnerWidth: pickString(
      data?.loadedInnerWidth ?? data?.loadedInnerArea,
    ),
    loadedInnerHeight: pickString(data?.loadedInnerHeight ?? data?.height),
    palletCount: pickString(data?.palletCount ?? data?.pallet),
    weight: typeof data?.weight === "number" ? data.weight : undefined,
    region: pickString(data?.region ?? data?.location ?? data?.area),
    location: pickString(data?.location ?? data?.region),
    garage: pickString(
      data?.garage ?? data?.garageLocation ?? data?.parkingLocation,
    ),
    description: pickString(
      data?.description ?? data?.detail ?? data?.detailContent,
    ),
    viewCount: data?.viewCount ?? data?.views ?? data?.hit,
    interestedProductId: resolveInterestedProductId(
      data as Record<string, unknown>,
    ),
    salesPeople: data?.salesPeople,
    safetyNumber: pickString(data?.safetyNumber),
    realOwnerName: pickString(data?.realOwnerName),
    sellerSafetyNumber: pickString(
      data?.sellerSafetyNumber ??
        data?.salesPeople?.safetyNumber ??
        data?.safetyNumber,
    ),
    ownerId: ownerId ?? data?.sellerId,
    memberId: data?.memberId ?? data?.sellerId,
    isMine:
      typeof data?.isMine === "boolean"
        ? data.isMine
        : currentMemberId !== undefined && ownerId !== undefined
          ? Number(currentMemberId) === Number(ownerId)
          : undefined,
    mainOptions:
      mainOptionsFromCarOption ??
      optionListBy("mainOptions", "generalOptions", "options"),
    additionalOptions:
      additionalOptionsFromCarOption ??
      optionListBy("additionalOptions", "extraOptions"),
    brakeOptions:
      brakeOptionsFromCarOption ?? optionListBy("brakeOptions", "breakOptions"),
    normalOption: {
      options: mainOptionsFromCarOption,
      etc: pickString(carOption?.normalOption?.etc),
    },
    additionalOption: {
      options: additionalOptionsFromCarOption,
      etc: pickString(carOption?.additionalOption?.etc),
    },
    brakeOption: {
      options: brakeOptionsFromCarOption,
      etc: pickString(
        carOption?.breakOption?.etc ?? carOption?.brakeOption?.etc,
      ),
    },
    inspectionValidityStart: pickString(
      data?.inspectionValidityStart ??
        data?.inspectionInvalidStartDate ??
        data?.inspectionStartDate ??
        data?.inspectionPeriodStart,
    ),
    inspectionValidityEnd: pickString(
      data?.inspectionValidityEnd ??
        data?.inspectionInvalidEndDate ??
        data?.inspectionEndDate ??
        data?.inspectionPeriodEnd,
    ),
    accidentStatus: hasAccident ? "사고" : "무사고",
    accidentContents,
    hasAccident,
    transportGoods: pickString(data?.transportGoods),
    transportStartLocate: data?.transportStartLocate,
    transportEndLocate: data?.transportEndLocate,
    tireStatus: data?.tireStatus,
    maintenanceData,
    maintenanceEtc,
    detailContent: pickString(data?.detailContent ?? data?.description),
    seizureCount:
      Number(
        data?.seizureCount ??
          data?.seizureHistoryCount ??
          (Array.isArray(data?.seizureHistory)
            ? data.seizureHistory.length
            : 0),
      ) || 0,
    mortgageCount:
      Number(
        data?.mortgageCount ??
          data?.mortgageHistoryCount ??
          (Array.isArray(data?.mortgageHistory)
            ? data.mortgageHistory.length
            : 0),
      ) || 0,
    ownerChangeCount:
      Number(
        data?.ownerChangeCount ??
          data?.ownerChangeHistoryCount ??
          data?.tradingHistoryCount ??
          (Array.isArray(data?.tradingHistory)
            ? data.tradingHistory.length
            : 0),
      ) || 0,
    structureChangeCount:
      Number(
        data?.structureChangeCount ??
          data?.structureChangeHistoryCount ??
          data?.tuningHistoryCount ??
          (Array.isArray(data?.tuningHistory) ? data.tuningHistory.length : 0),
      ) || 0,
    lastOwnerInfo: data?.lastOwnerInfo ?? undefined,
    seizureHistory: Array.isArray(data?.seizureHistory)
      ? data.seizureHistory
      : data?.seizureHistory === null
        ? null
        : undefined,
    mortgageHistory: Array.isArray(data?.mortgageHistory)
      ? data.mortgageHistory
      : data?.mortgageHistory === null
        ? null
        : undefined,
    tradingHistory: Array.isArray(data?.tradingHistory)
      ? data.tradingHistory
      : undefined,
    inspectionHistory: Array.isArray(data?.inspectionHistory)
      ? data.inspectionHistory
      : undefined,
    tuningHistory: Array.isArray(data?.tuningHistory)
      ? data.tuningHistory
      : undefined,
    maintenanceHistory,
    representImageUrl: resolveImageUri(
      data?.representImageUrl ?? data?.productsImage?.frontSideImageUrl,
    ),
    productImages: collectedImages,
    productsImages: collectedImages,
    productsImage: data?.productsImage,
    approvalStatusList: Array.isArray(data?.approvalStatusList)
      ? data.approvalStatusList
      : [],
    currentStep: data?.currentStep,
    totalStep: data?.totalStep,
    progressText: data?.progressText,
    manufacturerCategories:
      data?.manufacturerCategories &&
      typeof data.manufacturerCategories === "object"
        ? {
            id: Number(data.manufacturerCategories.id) || 0,
            name: String(data.manufacturerCategories.name ?? ""),
            code: data.manufacturerCategories.code,
          }
        : undefined,
    priceTrendModel:
      data?.model && typeof data.model === "object" && data.model.id != null
        ? {
            id: Number(data.model.id) || 0,
            name: String(data.model.name ?? ""),
          }
        : undefined,
    priceTrendLoaded:
      data?.loaded && typeof data.loaded === "object"
        ? {
            code: data.loaded.code,
            desc: data.loaded.desc,
          }
        : undefined,
    license: normalizeProductLicense(data?.license),
    youtubeUrl: pickString(data?.youtubeUrl),
    productsSalesNotice: pickString(data?.productsSalesNotice),
  };
};
