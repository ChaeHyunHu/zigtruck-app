/**
 * 컴포넌트 밖(유틸/핸들러)에서도 앱 디자인 토스트를 띄우기 위한 명령형 싱글톤.
 * ToastProvider가 마운트되면 실제 구현을 등록한다. (zigtruck-front 토스트와 동일한 형태)
 */
export type ToastType = "success" | "info";

export type ShowToastOptions = {
  message: string;
  type?: ToastType;
  /** 표시 시간(ms). 기본 2000 */
  duration?: number;
};

type ToastImpl = (options: ShowToastOptions) => void;

let impl: ToastImpl | null = null;

export function registerToast(next: ToastImpl | null) {
  impl = next;
}

export function showToast(messageOrOptions: string | ShowToastOptions) {
  if (!impl) return;
  if (typeof messageOrOptions === "string") {
    impl({ message: messageOrOptions });
    return;
  }
  impl(messageOrOptions);
}
