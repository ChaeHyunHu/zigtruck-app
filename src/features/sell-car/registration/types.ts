export type EnumPresenter = {
  code?: string;
  desc?: string;
  id?: number;
  name?: string;
};

export type RegistrationProduct = {
  id: number;
  ownerName?: string;
  truckName?: string;
  truckNumber?: string;
  year?: number | string;
  status?: EnumPresenter;
  type?: EnumPresenter;
  salesType?: EnumPresenter;
  manufacturerCategories?: { id?: number; name?: string; code?: string };
  model?: { id?: number; name?: string };
  modelDetail?: EnumPresenter;
  tons?: number | string;
  loaded?: EnumPresenter;
  loadedDetail?: EnumPresenter;
  loadedInnerLength?: number | string;
  loadedInnerArea?: number | string;
  loadedInnerHeight?: number | string;
  axis?: EnumPresenter;
  transmission?: EnumPresenter;
  distance?: number | string;
  power?: number | string;
  fuel?: EnumPresenter;
  color?: EnumPresenter;
  garage?: EnumPresenter;
  area1?: string;
  area2?: string;
  area3?: string;
  price?: number | null;
  isSaleLicense?: boolean;
  license?: {
    id?: number;
    licenseType?: EnumPresenter;
    price?: string | number | null;
  };
  isDuplicateProduct?: boolean;
  firstRegistrationDate?: string;
  productsImage?: Record<string, unknown> & {
    frontSideImageUrl?: string;
    backSideImageUrl?: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    certificateImageUrl?: string;
    tireImageUrl?: string;
    engineImageUrl?: string;
    insideImageUrl?: string;
    dashboardImageUrl?: string;
    sheetImageUrl?: string;
    optionImageUrls?: string[];
  };
  accident?: boolean;
  accidentContents?: string;
  accidentsHistory?: { accident?: boolean; accidentContents?: string };
  maintenance?: { maintenanceData?: EnumPresenter[]; etc?: string };
  carOption?: {
    normalOption?: { option?: EnumPresenter[]; etc?: string };
    additionalOption?: { option?: EnumPresenter[]; etc?: string };
    breakOption?: { option?: EnumPresenter[]; etc?: string };
  };
  transportGoods?: string;
  transportStartLocate?: EnumPresenter;
  transportEndLocate?: EnumPresenter;
  tireStatus?: EnumPresenter;
  detailContent?: string;
  carType?: string;
  identificationNumber?: string;
  carUse?: string;
  inspectionInvalidStartDate?: string;
  inspectionInvalidEndDate?: string;
  lastOwnerInfo?: { date?: string; content?: string };
  seizureHistory?: Array<{
    regDate?: string;
    content?: string;
    agency?: string;
    agencyPhoneNumber?: string;
  }> | null;
  mortgageHistory?: Array<{
    occurDate?: string;
    mortgageName?: string;
    debtorName?: string;
    amount?: number | string;
  }> | null;
  tradingHistory?: Array<{ date?: string; content?: string }>;
  inspectionHistory?: Array<{ date?: string; content?: string }>;
  tuningHistory?: Array<{ date?: string; before?: string; after?: string }>;
  seizureCount?: number | null;
  mortgageCount?: number | null;
  tradingHistoryCount?: number | null;
  tuningHistoryCount?: number | null;
  [key: string]: unknown;
};

export type ProductEnumData = {
  axis?: EnumPresenter[];
  color?: EnumPresenter[];
  fuel?: EnumPresenter[];
  garage?: EnumPresenter[];
  loaded?: EnumPresenter[];
  oneTonsLoaded?: Array<EnumPresenter & { loadedDetail?: EnumPresenter[] }>;
  manufacturerAndModel?: Array<{
    manufacturerCategories: { id: number; name: string; code?: string };
    model: Array<{ id: number; name: string; modelDetail?: EnumPresenter[] }>;
  }>;
  maintenanceCategories?: EnumPresenter[];
  normalOption?: EnumPresenter[];
  additionalOption?: EnumPresenter[];
  breakOption?: EnumPresenter[];
  tireStatus?: EnumPresenter[];
  transmission?: EnumPresenter[];
  [key: string]: unknown;
};

export type OwnerInfo = {
  licenseNumber: string;
  name: string;
};

export type OwnerErrorInfo = {
  licenseNumberError?: boolean;
  licenseNumberErrorMessage?: string;
  ownerNameError?: boolean;
  ownerNameErrorMessage?: string;
};
