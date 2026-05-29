import type { LicenseEnumItem } from "@/src/api/license";
import type { LicenseEnumField } from "@/src/features/license/types";

export const BASE_TONNAGE = 1.5;

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function filterLicenseTypesByTons(
  list: LicenseEnumItem[],
  tons: number,
): LicenseEnumItem[] {
  if (tons >= 0.5 && tons < 1.6) {
    return list.filter(
      (item) =>
        item.code !== "INDIVIDUAL_MIDDLE" && item.code !== "INDIVIDUAL_HIGH",
    );
  }
  if (tons >= 1.6 && tons < 17) {
    return list.filter(
      (item) =>
        item.code !== "INDIVIDUAL_SMALL" && item.code !== "INDIVIDUAL_HIGH",
    );
  }
  if (tons >= 17 && tons < 25) {
    return list.filter(
      (item) =>
        item.code !== "INDIVIDUAL_SMALL" && item.code !== "INDIVIDUAL_MIDDLE",
    );
  }
  return list;
}

export function getLicenseTypeDisplay(
  licenseType?: LicenseEnumField,
  maxTons?: number | string,
): string {
  if (!licenseType?.desc) return "";
  if (licenseType.code === "INDIVIDUAL" && maxTons) {
    return `${licenseType.desc} (1.5톤 이상 ~ ${maxTons}톤)`;
  }
  return licenseType.desc;
}

export function buildLicenseSearchQuery(
  params: import("@/src/features/license/types").LicenseSearchParams,
  page = 1,
): Record<string, string> {
  const query: Record<string, string> = { page: String(page) };
  if (params.minTons) query.minTons = params.minTons;
  if (params.maxTons) query.maxTons = params.maxTons;
  if (params.minYear) query.minYear = params.minYear;
  if (params.maxYear) query.maxYear = params.maxYear;
  if (params.licenseSalesType) query.licenseSalesType = params.licenseSalesType;
  if (params.licenseType?.code) query.licenseType = params.licenseType.code;
  if (params.useClassification?.code) {
    query.useClassification = params.useClassification.code;
  }
  if (params.memberId) query.memberId = String(params.memberId);
  return query;
}
