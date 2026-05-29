import { InteractionManager } from "react-native";

/** 바텀시트·모달 레이아웃 안정화 대기 */
export function runTutorialLayoutReady(delayMs = 560): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => resolve());
      });
    }, delayMs);
    return () => clearTimeout(timer);
  });
}
