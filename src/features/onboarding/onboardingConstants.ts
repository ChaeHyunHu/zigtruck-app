import { IMAGE_BASE_URL } from "@/src/constants/url";

/** 웹 `isFirst` / 온보딩 완료 여부와 동일한 역할 */
export const ONBOARDING_COMPLETED_KEY = "zigtruck-onboarding-completed";

export type OnboardingSlide = {
  title: string;
  descLines: string[];
  imageUrl: string;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: "실차주와 직거래",
    descLines: ["개인간 직거래로", "중간 마진없이 수수료 0원"],
    imageUrl: `${IMAGE_BASE_URL}/service_onboading1.jpg`,
  },
  {
    title: "간편하게 차량 등록",
    descLines: ["차량번호로 정보 조회 후", "간편하게 판매 등록하세요"],
    imageUrl: `${IMAGE_BASE_URL}/service_onboading2.jpg`,
  },
  {
    title: "내 차량 시세 확인",
    descLines: ["직트럭 데이터베이스로", "적절한 시세를 확인할 수 있어요"],
    imageUrl: `${IMAGE_BASE_URL}/service_onboading3.jpg`,
  },
  {
    title: "다양한 서비스",
    descLines: ["번호판 거래, 운행일지 등", "직트럭의 모든 서비스를 이용하세요"],
    imageUrl: `${IMAGE_BASE_URL}/service_onboading4.jpg`,
  },
];
