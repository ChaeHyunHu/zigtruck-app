export type LicenseEnumField = { code: string; desc: string };

export type LicenseItem = {
  id: number;
  year?: number | string;
  tons?: number | string;
  price?: number;
  maxTons?: number | string;
  requested?: boolean;
  isMyLicense?: boolean;
  insuranceRate?: number | string;
  fee?: number | string;
  licenseType?: LicenseEnumField;
  licenseSalesType?: LicenseEnumField;
  useClassification?: LicenseEnumField;
  status?: LicenseEnumField;
  licenseCounselStatus?: LicenseEnumField;
};

export type LicenseSearchParams = {
  minYear: string;
  maxYear: string;
  minTons: string;
  maxTons: string;
  licenseSalesType: string;
  licenseType: LicenseEnumField;
  useClassification: LicenseEnumField;
  page: number;
  memberId: number | null;
};

export const defaultLicenseSearchParams = (
  memberId: number | null = null,
): LicenseSearchParams => {
  const year = new Date().getFullYear();
  return {
    minYear: "2000",
    maxYear: String(year + 1),
    minTons: "1",
    maxTons: "27",
    licenseSalesType: "",
    licenseType: { code: "", desc: "" },
    useClassification: { code: "", desc: "" },
    page: 1,
    memberId,
  };
};
