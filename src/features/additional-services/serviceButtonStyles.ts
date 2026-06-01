import { appColors } from "@/src/constants/colors";

/** zigtruck-front 서비스 신청완료 버튼 (연한 회색 배경 + 중간 회색 텍스트) */
export const SERVICE_COMPLETED_BUTTON = {
  backgroundColor: appColors.gray400,
  borderColor: appColors.gray400,
  textColor: appColors.gray600,
} as const;

export const SERVICE_PRIMARY_BUTTON = {
  backgroundColor: appColors.primary,
  borderColor: appColors.primary,
  textColor: "#FFFFFF",
} as const;
