export const SALES_TYPE_ASSURANCE = "ASSURANCE";
export const SALES_TYPE_NORMAL = "NORMAL";
export const SALES_TYPE_CONSIGNMENT = "CONSIGNMENT";
export const SALES_TYPE_THIRD_PARTY_DEALER = "THIRD_PARTY_DEALER";

export const PRODUCT_TYPE_DIRECT = "DIRECT";
export const PRODUCT_TYPE_SPEED = "SPEED";

export const SALESTYPE = {
  DIRECT: "직거래 셀프 판매",
  SPEED: "직트럭에 즉시 매각",
} as const;

export const SALES_TYPE_FILTER_OPTIONS = [
  { value: undefined, label: "전체차량" },
  { value: SALES_TYPE_NORMAL, label: "직거래 차량" },
  { value: SALES_TYPE_ASSURANCE, label: "직트럭 상품용" },
  { value: SALES_TYPE_CONSIGNMENT, label: "위탁판매 차량" },
] as const;

export const PRODUCT_STATUS_BEFORE_SALE = "BEFORE_SALE";
export const PRODUCT_STATUS_SALE = "SALE";
export const MAINTENANCE_SALE = "MAINTENANCE_SALE";
export const PRODUCT_STATUS_PAUSE = "PAUSE";
export const PRODUCT_STATUS_WAITING = "WAITING";
export const PRODUCT_STATUS_COMPLETE = "COMPLETED";
export const PRODUCT_STATUS_ORIGIN_DATA_REGISTER = "ORIGIN_DATA_REGISTER";

export const APPROVAL_STATUS_APPROVAL = "APPROVAL";
export const APPROVAL_STATUS_REJECT = "REJECT";
export const APPROVAL_STATUS_WAITING = "WAITING";

export const SORT_OPTIONS = [
  { value: "createdAt,DESC", label: "기본 정렬순" },
  { value: "price,ASC", label: "낮은 가격순" },
  { value: "price,DESC", label: "높은 가격순" },
  { value: "distance,ASC", label: "주행거리 낮은순" },
  { value: "firstRegistrationDate,DESC", label: "연식 최신순" },
  { value: "firstRegistrationDate,ASC", label: "연식 오래된순" },
] as const;

export const QUICK_SORT_OPTIONS = [
  { value: "createdAt,DESC", label: "기본 정렬순" },
  { value: "firstRegistrationDate,DESC", label: "높은 연식순" },
  { value: "distance,ASC", label: "낮은 주행거리순" },
] as const;
