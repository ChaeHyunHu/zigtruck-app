import { Alert } from "react-native";
import type React from "react";

/**
 * 컴포넌트 밖(유틸/훅/이벤트 핸들러)에서도 앱 디자인 다이얼로그를 띄우기 위한 명령형 싱글톤.
 * AppDialogProvider가 마운트되면 실제 구현을 등록한다.
 * 등록 전(프로바이더 밖)에서는 네이티브 Alert로 폴백한다.
 */
export type AppAlertOptions = {
  title: string;
  message?: string;
  content?: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
};

export type AppConfirmOptions = {
  title?: string;
  message?: string;
  content?: React.ReactNode;
  leftLabel?: string;
  rightLabel: string;
  onLeft?: () => void;
  onRight: () => void;
};

type AppDialogImpl = {
  alert: (options: AppAlertOptions) => void;
  confirm: (options: AppConfirmOptions) => void;
};

let impl: AppDialogImpl | null = null;

export function registerAppDialog(next: AppDialogImpl | null) {
  impl = next;
}

export function showAppAlert(options: AppAlertOptions) {
  if (impl) {
    impl.alert(options);
    return;
  }
  Alert.alert(options.title, options.message, [
    { text: options.confirmLabel ?? "확인", onPress: options.onConfirm },
  ]);
}

export function showAppConfirm(options: AppConfirmOptions) {
  if (impl) {
    impl.confirm(options);
    return;
  }
  Alert.alert(options.title ?? "", options.message, [
    { text: options.leftLabel ?? "취소", style: "cancel", onPress: options.onLeft },
    { text: options.rightLabel, onPress: options.onRight },
  ]);
}
