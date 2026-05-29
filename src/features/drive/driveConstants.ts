import { IMAGE_BASE_URL } from "@/src/constants/url";

export type DriveOnboardingSlide = {
  title: string;
  descLines: string[];
  imageUrl: string;
};

export const DRIVE_ONBOARDING_SLIDES: DriveOnboardingSlide[] = [
  {
    title: "월별 매출 · 수익 계산",
    descLines: ["간단한 입력만으로 월별 매출과", "수익을 계산할 수 있어요."],
    imageUrl: `${IMAGE_BASE_URL}/drive_onboading1.jpg`,
  },
  {
    title: "간편한 미수금 관리",
    descLines: ["‘전체 수금처리’ 버튼으로 미수금도", "한 번에 처리가 가능해요."],
    imageUrl: `${IMAGE_BASE_URL}/drive_onboading2.jpg`,
  },
  {
    title: "자동 거리 계산",
    descLines: ["카카오 주소 연동 시스템으로", "상하차지 거리를 자동으로 계산해요."],
    imageUrl: `${IMAGE_BASE_URL}/drive_onboading3.jpg`,
  },
  {
    title: "주유비 자동 입력 기능",
    descLines: ["영수증 사진을 업로드하면", "주유비가 자동으로 입력돼요."],
    imageUrl: `${IMAGE_BASE_URL}/drive_onboading4.jpg`,
  },
  {
    title: "카테고리 관리 기능",
    descLines: ["지출・수익 카테고리를 직접", "편집하여 관리할 수 있어요."],
    imageUrl: `${IMAGE_BASE_URL}/drive_onboading5.jpg`,
  },
];

export const DRIVE_TUTORIAL_POPUP_IMAGE = `${IMAGE_BASE_URL}/driveTutorialPopup.jpg`;

export const DRIVE_HISTORY_TYPE_TRANSPORT = "TRANSPORT";
export const DRIVE_HISTORY_TYPE_EMPTY_TRANSPORT = "EMPTY_TRANSPORT";

export const EXPENSE = "EXPENSE";
export const INCOME = "INCOME";
export const EXPENSE_UNCLASSIFIED = "EXPENSE_UNCLASSIFIED";
export const INCOME_UNCLASSIFIED = "INCOME_UNCLASSIFIED";

export const DRIVE_HISTORY_LOCATE = "DRIVE_HISTORY_LOCATE";
export const DRIVE_HISTORY_TRANSPORT_COMPANY = "DRIVE_HISTORY_TRANSPORT_COMPANY";
export const DRIVE_HISTORY_TRANSPORT_ITEM = "DRIVE_HISTORY_TRANSPORT_ITEM";
