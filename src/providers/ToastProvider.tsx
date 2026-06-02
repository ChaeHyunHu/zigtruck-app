import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ToastView } from "@/src/components/common/Toast";
import {
  registerToast,
  type ShowToastOptions,
  type ToastType,
} from "@/src/providers/toast";

type ToastContextValue = {
  show: (options: ShowToastOptions | string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const FADE_MS = 220;
const DEFAULT_DURATION = 2000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const show = useCallback(
    (options: ShowToastOptions | string) => {
      const opts: ShowToastOptions =
        typeof options === "string" ? { message: options } : options;
      if (!opts.message) return;

      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message: opts.message, type: opts.type ?? "success" });

      opacity.stopAnimation();
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: FADE_MS,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) setToast(null);
        });
      }, opts.duration ?? DEFAULT_DURATION);
    },
    [opacity],
  );

  useEffect(() => {
    registerToast(show);
    return () => {
      registerToast(null);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [show]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <ToastView
          message={toast.message}
          type={toast.type}
          opacity={opacity}
          bottomOffset={insets.bottom + 90}
        />
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
