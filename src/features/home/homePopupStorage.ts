import AsyncStorage from "@react-native-async-storage/async-storage";

import { formatYYYYMMDD } from "@/src/features/drive/driveDateUtils";
import { ONBOARDING_COMPLETED_KEY } from "@/src/features/onboarding/onboardingConstants";

const HOME_POPUP_HIDE_DATE_KEY = "homePopupBannerHideDate";

/** 앱 실행 중 닫기·배경 탭 등으로 닫은 경우 재노출 방지 */
let sessionDismissed = false;

/** 진행 중인 노출 요청 무효화 (닫기 직후 setVisible(true) 재실행 방지) */
let openRequestGeneration = 0;

export function beginHomePopupOpenRequest(): number {
  openRequestGeneration += 1;
  return openRequestGeneration;
}

export function invalidateHomePopupOpenRequests(): void {
  openRequestGeneration += 1;
}

export function isHomePopupOpenRequestActive(requestId: number): boolean {
  return requestId === openRequestGeneration && !sessionDismissed;
}

export async function getHomePopupHideDate(): Promise<string | null> {
  return AsyncStorage.getItem(HOME_POPUP_HIDE_DATE_KEY);
}

export async function setHomePopupHideToday(): Promise<void> {
  await AsyncStorage.setItem(HOME_POPUP_HIDE_DATE_KEY, formatYYYYMMDD(new Date()));
}

export function markHomePopupDismissedSession(): void {
  sessionDismissed = true;
  invalidateHomePopupOpenRequests();
}

export function isHomePopupSessionDismissed(): boolean {
  return sessionDismissed;
}

export async function isOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
  return value === "true";
}

/** 온보딩 완료 후 + 오늘 하루 보지 않기 미설정 + 세션에서 닫지 않은 경우 */
export async function shouldShowHomePopupToday(): Promise<boolean> {
  if (sessionDismissed) return false;
  if (!(await isOnboardingCompleted())) return false;
  const hiddenDate = await getHomePopupHideDate();
  return hiddenDate !== formatYYYYMMDD(new Date());
}
