export type DriveTutorialStep = 0 | 1 | 2 | 3 | 4 | 5;

/** 웹 DriveHome.tsx setTimeout(..., 500) 과 동일 */
export const TUTORIAL_STEP_DELAY_MS = 500;

/** 웹 reactour steps[] selector 순서 */
export const DRIVE_TUTORIAL_SELECTORS = [
  ".todayTile abbr",
  ".add-drive-form-btn",
  ".drive-form-type",
  ".addOtherExpenseFormBtn",
  ".cateogryManageTutorial",
  ".categoryEditTutorial",
] as const;

/** 툴팁을 하이라이트 위/아래 중 어디에 둘지 */
export type DriveTutorialTooltipPlacement = "above" | "below";

/** 0=날짜 위, 1=+일지 위, 3=시트 안 +기타내역 위, 그 외=하이라이트 아래 */
export function getTutorialTooltipPlacement(
  step: DriveTutorialStep,
): DriveTutorialTooltipPlacement {
  if (step === 0 || step === 1 || step === 3) return "above";
  return "below";
}

/** @deprecated 앵커 onLayout 측정 사용 — 웹과 동일하게 500ms만 사용 */
export function getTutorialLayoutDelay(_step: DriveTutorialStep): number {
  return 0;
}

/** @deprecated 앵커 onLayout 측정 사용 */
export function getSheetSettleDelay(step: DriveTutorialStep): number {
  return step === 0 ? 0 : TUTORIAL_STEP_DELAY_MS;
}
