import type { LicenseEnumField, LicenseItem } from "@/src/features/license/types";

export const LICENSE_STATUS_BEFORE_SALE = "BEFORE_SALE";
export const LICENSE_STATUS_SALE = "SALE";
export const LICENSE_STATUS_PAUSE = "PAUSE";
export const LICENSE_STATUS_COMPLETED = "COMPLETED";
export const LICENSE_STATUS_COUNSEL_COMPLETED = "COUNSEL_COMPLETED";
export const LICENSE_STATUS_REQUEST = "REQUEST";
export const LICENSE_STATUS_COUNSELING = "COUNSELING";

/** 웹 LicenseItemView — BEFORE_SALE 이면 상담 상태 표시 */
export function resolveLicenseDisplayStatus(
  item: LicenseItem,
): LicenseEnumField | undefined {
  if (
    item.status?.code === LICENSE_STATUS_BEFORE_SALE &&
    item.licenseCounselStatus?.desc
  ) {
    return item.licenseCounselStatus;
  }
  return item.status;
}

export function getLicenseStatusBadgeStyle(code: string | undefined): {
  containerClass: string;
  textClass: string;
} {
  switch (code) {
    case LICENSE_STATUS_SALE:
      return {
        containerClass: "bg-[#F8FAFF]",
        textClass: "text-[#5578F0]",
      };
    case LICENSE_STATUS_COMPLETED:
      return {
        containerClass: "bg-gray100",
        textClass: "text-gray600",
      };
    case LICENSE_STATUS_COUNSEL_COMPLETED:
      return {
        containerClass: "bg-gray300",
        textClass: "text-gray600",
      };
    case LICENSE_STATUS_REQUEST:
    case LICENSE_STATUS_COUNSELING:
      return {
        containerClass: "bg-gray100",
        textClass: "text-[#2E7D32]",
      };
    case LICENSE_STATUS_PAUSE:
      return {
        containerClass: "bg-gray100",
        textClass: "text-danger",
      };
    default:
      return {
        containerClass: "bg-gray100",
        textClass: "text-gray700",
      };
  }
}

export type LicenseMenuAction = {
  code: string;
  label: string;
};

export function buildLicenseMenuItems(
  statusCode: string | undefined,
): LicenseMenuAction[] {
  const items: LicenseMenuAction[] = [];

  const add = (code: string, label: string, condition = true) => {
    if (condition) items.push({ code, label });
  };

  switch (statusCode) {
    case "ORIGIN_DATA_REGISTER":
    case LICENSE_STATUS_BEFORE_SALE:
      add("MODIFY", "수정하기");
      add("DELETE", "삭제하기");
      break;
    case LICENSE_STATUS_SALE:
      add("COMPLETED", "판매완료");
      add("PAUSE", "판매중지");
      add("MODIFY", "수정하기");
      add("DELETE", "삭제하기");
      break;
    case LICENSE_STATUS_PAUSE:
      add("SALE", "판매중");
      add("MODIFY", "수정하기");
      add("DELETE", "삭제하기");
      break;
    case LICENSE_STATUS_COMPLETED:
      add("DELETE", "삭제하기");
      break;
    default:
      add("DELETE", "삭제하기");
      break;
  }

  return items;
}
