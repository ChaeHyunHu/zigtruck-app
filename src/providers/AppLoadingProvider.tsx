import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AppLoadingOverlay } from "@/src/components/common/AppLoadingOverlay";
import {
  registerAppLoading,
  type AppLoadingOptions,
} from "@/src/providers/appLoading";

type AppLoadingContextValue = {
  show: (options?: AppLoadingOptions) => void;
  hide: () => void;
  visible: boolean;
};

const AppLoadingContext = createContext<AppLoadingContextValue | null>(null);

export function AppLoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const requestCountRef = useRef(0);

  const show = useCallback((options?: AppLoadingOptions) => {
    requestCountRef.current += 1;
    if (options?.message) setMessage(options.message);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    requestCountRef.current = Math.max(0, requestCountRef.current - 1);
    if (requestCountRef.current === 0) {
      setVisible(false);
      setMessage(undefined);
    }
  }, []);

  useEffect(() => {
    registerAppLoading({ show, hide });
    return () => registerAppLoading(null);
  }, [hide, show]);

  const value = useMemo(
    () => ({ show, hide, visible }),
    [hide, show, visible],
  );

  return (
    <AppLoadingContext.Provider value={value}>
      {children}
      {/* iOS: 네이티브 Modal로 띄우면 다른 다이얼로그(AlertDialog 등) Modal이 닫히는
          도중 로딩 오버레이 Modal이 present되며 orphaned 상태가 되어 화면 터치가
          막힌다. 절대 위치 오버레이로 렌더해 모달 중첩 충돌을 원천 차단한다. */}
      <AppLoadingOverlay visible={visible} message={message} embedded />
    </AppLoadingContext.Provider>
  );
}

export function useAppLoading() {
  const ctx = useContext(AppLoadingContext);
  if (!ctx) {
    throw new Error("useAppLoading must be used within AppLoadingProvider");
  }
  return ctx;
}

/** 페이지 로딩 상태에 맞춰 전역 오버레이 표시 */
export function useAppLoadingOverlay(active: boolean, message?: string) {
  const { show, hide } = useAppLoading();

  useEffect(() => {
    if (!active) {
      hide();
      return;
    }
    show(message ? { message } : undefined);
    return hide;
  }, [active, hide, message, show]);
}
