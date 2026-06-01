import { router, useGlobalSearchParams } from "expo-router";
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
  const entrySourceRef = useRef<RegistrationEntrySource>(
    REGISTRATION_ENTRY_SELL_CAR,
  );
  const [visible, setVisible] = useState(false);

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
    if (entrySourceRef.current === REGISTRATION_ENTRY_MANAGE) {
      router.replace("/(tabs)/manage");
      return;
    }
    router.replace("/sell-car");
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
