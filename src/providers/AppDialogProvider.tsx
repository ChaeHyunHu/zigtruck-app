import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Text } from "react-native";

import { AlertDialog } from "@/src/components/common/AlertDialog";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";

type AlertOptions = {
  title: string;
  message?: string;
  content?: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
};

type ConfirmOptions = {
  title?: string;
  message?: string;
  content?: React.ReactNode;
  leftLabel?: string;
  rightLabel: string;
  onLeft?: () => void;
  onRight: () => void;
};

type AppDialogContextValue = {
  alert: (options: AlertOptions) => void;
  confirm: (options: ConfirmOptions) => void;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export function AppDialogProvider({ children }: { children: React.ReactNode }) {
  const [alertState, setAlertState] = useState<
    (AlertOptions & { visible: true }) | { visible: false }
  >({ visible: false });
  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { visible: true }) | { visible: false }
  >({ visible: false });

  const alert = useCallback((options: AlertOptions) => {
    setAlertState({ ...options, visible: true });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState({ ...options, visible: true });
  }, []);

  const closeAlert = useCallback(() => {
    if (alertState.visible) {
      const onConfirm = alertState.onConfirm;
      setAlertState({ visible: false });
      onConfirm?.();
    }
  }, [alertState]);

  const closeConfirmLeft = useCallback(() => {
    if (confirmState.visible) {
      const onLeft = confirmState.onLeft;
      setConfirmState({ visible: false });
      onLeft?.();
    }
  }, [confirmState]);

  const closeConfirmRight = useCallback(() => {
    if (confirmState.visible) {
      const onRight = confirmState.onRight;
      setConfirmState({ visible: false });
      onRight();
    }
  }, [confirmState]);

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm]);

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      <AlertDialog
        visible={alertState.visible}
        title={alertState.visible ? alertState.title : undefined}
        message={alertState.visible ? alertState.message : undefined}
        confirmLabel={alertState.visible ? alertState.confirmLabel : undefined}
        onConfirm={closeAlert}
      >
        {alertState.visible ? alertState.content : null}
      </AlertDialog>
      <ConfirmDialog
        visible={confirmState.visible}
        title={confirmState.visible ? confirmState.title : undefined}
        leftLabel={confirmState.visible ? confirmState.leftLabel : undefined}
        rightLabel={confirmState.visible ? confirmState.rightLabel : undefined}
        onLeft={closeConfirmLeft}
        onRight={confirmState.visible ? closeConfirmRight : undefined}
      >
        {confirmState.visible ? (
          confirmState.content ??
          (confirmState.message ? (
            <Text className="text-center text-[15px] leading-[22px] text-gray700">
              {confirmState.message}
            </Text>
          ) : null)
        ) : null}
      </ConfirmDialog>
    </AppDialogContext.Provider>
  );
}

export function useAppDialog() {
  const ctx = useContext(AppDialogContext);
  if (!ctx) {
    throw new Error("useAppDialog must be used within AppDialogProvider");
  }
  return ctx;
}
