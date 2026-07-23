import { router, useGlobalSearchParams, usePathname } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BackHandler } from "react-native";

import { RegistrationExitConfirmModal } from "@/src/features/sell-car/registration/RegistrationExitConfirmModal";
import { useProductRegistration } from "@/src/providers/ProductRegistrationProvider";

export const REGISTRATION_ENTRY_MANAGE = "manage";
export const REGISTRATION_ENTRY_SELL_CAR = "sell-car";

type RegistrationEntrySource =
  | typeof REGISTRATION_ENTRY_MANAGE
  | typeof REGISTRATION_ENTRY_SELL_CAR;

type RegistrationExitGuardContextValue = {
  requestExit: () => void;
  dismissExit: () => void;
  isExitConfirmVisible: boolean;
};

const RegistrationExitGuardContext =
  createContext<RegistrationExitGuardContextValue | null>(null);

export function RegistrationExitGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resetRegistration } = useProductRegistration();
  const { from } = useGlobalSearchParams<{ from?: string }>();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const entrySourceRef = useRef<RegistrationEntrySource>(
    REGISTRATION_ENTRY_SELL_CAR,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (from === REGISTRATION_ENTRY_MANAGE) {
      entrySourceRef.current = REGISTRATION_ENTRY_MANAGE;
    }
  }, [from]);

  const requestExit = useCallback(() => {
    setVisible(true);
  }, []);

  const dismissExit = useCallback(() => {
    setVisible(false);
  }, []);

  const handleExit = useCallback(() => {
    setVisible(false);
    resetRegistration();

    const path = pathnameRef.current ?? "";
    // 등록 첫 단계(등록원부 확인 / 모델 선택 1/9)에서 나가면 내차판매로,
    // 그 이후(작성 진행 중)에 나가면 임시저장 차량을 볼 수 있는 내차관리로 이동.
    const isFirstStep =
      path.includes("/products/sales/info") ||
      path.includes("/products/sales/model");
    const target =
      entrySourceRef.current === REGISTRATION_ENTRY_MANAGE
        ? "/(tabs)/manage"
        : isFirstStep
          ? "/sell-car"
          : "/(tabs)/manage";

    // 확인 오버레이(setVisible(false))가 먼저 제거된 뒤 화면을 전환한다.
    requestAnimationFrame(() => {
      router.replace(target);
    });
  }, [resetRegistration]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setVisible(false);
      return true;
    });
    return () => subscription.remove();
  }, [visible]);

  const value = useMemo(
    () => ({
      requestExit,
      dismissExit,
      isExitConfirmVisible: visible,
    }),
    [dismissExit, requestExit, visible],
  );

  return (
    <RegistrationExitGuardContext.Provider value={value}>
      {children}
      <RegistrationExitConfirmModal
        visible={visible}
        onContinue={dismissExit}
        onExit={handleExit}
      />
    </RegistrationExitGuardContext.Provider>
  );
}

export function useRegistrationExitGuard() {
  const ctx = useContext(RegistrationExitGuardContext);
  if (!ctx) {
    throw new Error(
      "useRegistrationExitGuard must be used within RegistrationExitGuardProvider",
    );
  }
  return ctx;
}

export function useRegistrationExitGuardOptional() {
  return useContext(RegistrationExitGuardContext);
}
