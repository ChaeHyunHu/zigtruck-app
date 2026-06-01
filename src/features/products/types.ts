export type EnumValue = { code?: string; desc?: string; name?: string };

export type ProductListItem = {
  id: number;
  productsNumber?: number | string;
  representImageUrl?: string;
  truckName?: string;
  truckNumber?: string;
  firstRegistrationDate?: string;
  distance?: number;
  loadedInnerLength?: string | number;
  power?: number | string;
  region?: string;
  location?: string;
  transmission?: EnumValue | string;
  fuel?: EnumValue | string;
  price?: number | null;
  salesType?: EnumValue | string;
  status?: EnumValue | string;
  imageUrls?: string[];
  palletCount?: number | string;
  /** 번호판 별도 판매 여부 (API: 1 = 있음) */
  isLicense?: number;
  youtubeUrl?: string;
};

export type ApprovalStatusItem = {
  status?: EnumValue;
  reason?: string;
  modifiedDate?: string;
};

export type ProductImageItem = {
  id?: number;
  imageUrl?: string;
  url?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  isRepresentative?: boolean;
  representative?: boolean;
  frontSideImageUrl?: string;
};

export type MaintenanceItem = {
  id?: number;
  title?: string;
  date?: string;
  description?: string;
};

export type CarOptionGroup = {
  options?: string[];
  etc?: string;
};

export type HistoryItem = {
  date?: string;
  content?: string;
  before?: string;
  after?: string;
  regDate?: string;
  agency?: string;
  agencyPhoneNumber?: string;
  mortgageName?: string;
  ownerName?: string;
  debtorName?: string;
  amount?: string;
  occurDate?: string;
  terminateDate?: string;
};

export type ProductDetailLicense = {
  id?: number;
  licenseType?: EnumValue;
  licenseSalesType?: EnumValue;
  status?: EnumValue;
  price?: string | number | null;
  tons?: number | string | null;
  maxTons?: number | string | null;
  locate?: EnumValue;
  year?: number;
  useClassification?: EnumValue;
  licenseCounselStatus?: EnumValue;
};

export type ProductDetail = {
  id: number;
  productsNumber?: number | string;
  truckName?: string;
  truckNumber?: string;
  vehicleNumber?: string;
  price?: number | null;
  actualSalePrice?: number | null;
  status?: EnumValue;
  type?: EnumValue;
  salesType?: EnumValue;
  manufacturer?: EnumValue | string;
  model?: EnumValue | string;
  subModel?: EnumValue | string;
  vehicleType?: EnumValue | string;
  axis?: EnumValue | string;
  transmission?: EnumValue | string;
  fuel?: EnumValue | string;
  loadedType?: EnumValue | string;
  color?: EnumValue | string;
  firstRegistrationDate?: string;
  modelYear?: string | number;
  distance?: number;
  power?: number;
  tons?: number | string;
  loadedInnerLength?: number | string;
  loadedInnerArea?: number | string;
  loadedInnerWidth?: number | string;
  loadedInnerHeight?: number | string;
  palletCount?: number | string;
  weight?: number;
  region?: string;
  location?: string;
  garage?: string;
  description?: string;
  viewCount?: number;
  ownerId?: number;
  memberId?: number;
  isMine?: boolean;
  mainOptions?: string[];
  additionalOptions?: string[];
  brakeOptions?: string[];
  normalOption?: CarOptionGroup;
  additionalOption?: CarOptionGroup;
  brakeOption?: CarOptionGroup;
  inspectionValidityStart?: string;
  inspectionValidityEnd?: string;
  accidentContents?: string;
  hasAccident?: boolean;
  transportGoods?: string;
  transportStartLocate?: EnumValue | string;
  transportEndLocate?: EnumValue | string;
  tireStatus?: EnumValue | string;
  maintenanceData?: string[];
  maintenanceEtc?: string;
  detailContent?: string;
  accidentStatus?: EnumValue | string;
  seizureCount?: number;
  mortgageCount?: number;
  ownerChangeCount?: number;
  structureChangeCount?: number;
  lastOwnerInfo?: HistoryItem;
  seizureHistory?: HistoryItem[] | null;
  mortgageHistory?: HistoryItem[] | null;
  tradingHistory?: HistoryItem[];
  inspectionHistory?: HistoryItem[];
  tuningHistory?: HistoryItem[];
  maintenanceHistory?: MaintenanceItem[];
  representImageUrl?: string;
  productImages?: ProductImageItem[];
  productsImages?: ProductImageItem[];
  productsImage?: ProductImageItem;
  approvalStatusList?: ApprovalStatusItem[];
  currentStep?: number;
  totalStep?: number;
  progressText?: string;
  interestedProductId?: number | null;
  salesPeople?: {
    phoneNumber?: string;
    safetyNumber?: string;
  };
  safetyNumber?: string;
  manufacturerCategories?: { id: number; name: string; code?: string };
  priceTrendModel?: { id: number; name: string };
  priceTrendLoaded?: EnumValue;
  realOwnerName?: string;
  sellerSafetyNumber?: string;
  license?: ProductDetailLicense | null;
  youtubeUrl?: string;
  productsSalesNotice?: string;
};

export type ProductFilterValues = {
  search?: string;
  onlyOneTon?: boolean;
  sort?: string;
  salesType?: string;
  manufacturer?: string;
  vehicleType?: string;
  priceMin?: number;
  priceMax?: number;
};
