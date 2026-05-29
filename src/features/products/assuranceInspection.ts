import {
  MAINTENANCE_SALE,
  SALES_TYPE_ASSURANCE,
} from "@/src/constants/products";
import type { EnumValue } from "@/src/features/products/types";
import { enumCode } from "@/src/features/products/utils";

export const INSPECTION_COMPLETED_ICON_URL =
  "https://zigtruck-service-public-image.s3.ap-northeast-2.amazonaws.com/InspectionCompleted.png";

export const YOUTUBE_ICON_URL =
  "https://zigtruck-service-public-image.s3.ap-northeast-2.amazonaws.com/youtube_icon.png";

export const ASSURANCE_GREEN = "#34A853";
export const ASSURANCE_INSPECTION_COMPLETE_BG = "#EBF6EE";
export const ASSURANCE_INSPECTION_COMPLETE_BORDER = "#00741F";
export const ASSURANCE_INSPECTION_MAINTENANCE_BG = "#45A186";

export function isAssuranceMaintenanceSale(
  salesType?: EnumValue | string,
  status?: EnumValue | string,
): boolean {
  return (
    enumCode(salesType) === SALES_TYPE_ASSURANCE &&
    enumCode(status) === MAINTENANCE_SALE
  );
}

export function isAssuranceProduct(
  salesType?: EnumValue | string,
): boolean {
  return enumCode(salesType) === SALES_TYPE_ASSURANCE;
}
