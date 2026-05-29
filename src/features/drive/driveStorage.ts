import AsyncStorage from "@react-native-async-storage/async-storage";

export const DRIVE_ONBOARDING_SEEN_KEY = "isShowDriveOnBoading";
export const DRIVE_TUTORIAL_KEY = "driveTutorial";

export async function getDriveOnboardingSeen(): Promise<boolean> {
  const value = await AsyncStorage.getItem(DRIVE_ONBOARDING_SEEN_KEY);
  return value === "false";
}

export async function setDriveOnboardingSeen(seen: boolean): Promise<void> {
  await AsyncStorage.setItem(DRIVE_ONBOARDING_SEEN_KEY, seen ? "false" : "true");
}

/** 웹 localStorage `driveTutorial` 과 동일 (`true` = 가이드 대상) */
export async function getDriveTutorial(): Promise<string | null> {
  return AsyncStorage.getItem(DRIVE_TUTORIAL_KEY);
}

export async function setDriveTutorial(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(DRIVE_TUTORIAL_KEY, enabled ? "true" : "false");
}

export async function clearDriveTutorial(): Promise<void> {
  await AsyncStorage.removeItem(DRIVE_TUTORIAL_KEY);
}
