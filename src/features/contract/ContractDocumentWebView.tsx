import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

import {
  CONTRACT_CAPTURE_ERROR_TYPE,
  CONTRACT_CAPTURE_MESSAGE_TYPE,
  CONTRACT_CAPTURE_SCRIPT,
} from "@/src/features/contract/contractWebViewCapture";
import { buildContractHtml } from "@/src/features/contract/contractHtml";
import type { ContractInfo } from "@/src/features/contract/types";

const WEBVIEW_BASE_URL = "https://zigtruck.io";

type Props = {
  contract: ContractInfo;
};

export type ContractDocumentWebViewRef = {
  captureAsJpeg: () => Promise<string>;
};

export const ContractDocumentWebView = forwardRef<ContractDocumentWebViewRef, Props>(
  function ContractDocumentWebView({ contract }, ref) {
    const webViewRef = useRef<WebView>(null);
    const captureResolveRef = useRef<((value: string) => void) | null>(null);
    const captureRejectRef = useRef<((reason: Error) => void) | null>(null);
    const captureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const html = useMemo(() => buildContractHtml(contract), [
      contract.id,
      contract.transferorCompleted,
      contract.transfereeCompleted,
      contract.tradingAmount,
      contract.transferorSignImageUrl,
      contract.transfereeSignImageUrl,
      contract.transferorName,
      contract.transfereeName,
      contract.transferorAddress,
      contract.transfereeAddress,
      contract.transfereePhoneNumber,
      contract.transferorPhoneNumber,
      contract.balance,
      contract.downPayment,
      contract.intermediatePayment,
      contract.additionalConditions,
    ]);

    const source = useMemo(
      () => ({
        html,
        baseUrl: WEBVIEW_BASE_URL,
      }),
      [html],
    );

    const clearCaptureWaiters = () => {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
        captureTimeoutRef.current = null;
      }
      captureResolveRef.current = null;
      captureRejectRef.current = null;
    };

    useImperativeHandle(ref, () => ({
      captureAsJpeg: () =>
        new Promise<string>((resolve, reject) => {
          clearCaptureWaiters();
          captureResolveRef.current = resolve;
          captureRejectRef.current = reject;
          captureTimeoutRef.current = setTimeout(() => {
            captureRejectRef.current?.(
              new Error("계약서 이미지 생성 시간이 초과되었습니다."),
            );
            clearCaptureWaiters();
          }, 45000);
          webViewRef.current?.injectJavaScript(CONTRACT_CAPTURE_SCRIPT);
        }),
    }));

    const settleCapture = (ok: boolean, value: string) => {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
        captureTimeoutRef.current = null;
      }
      if (ok) {
        captureResolveRef.current?.(value);
      } else {
        captureRejectRef.current?.(new Error(value));
      }
      captureResolveRef.current = null;
      captureRejectRef.current = null;
    };

    return (
      <View className="flex-1 bg-white">
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={source}
          javaScriptEnabled
          domStorageEnabled
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: "#fff" }}
          onMessage={(event) => {
            try {
              const payload = JSON.parse(event.nativeEvent.data) as {
                type?: string;
                dataUrl?: string;
                message?: string;
              };
              if (payload.type === CONTRACT_CAPTURE_MESSAGE_TYPE && payload.dataUrl) {
                settleCapture(true, payload.dataUrl);
                return;
              }
              if (payload.type === CONTRACT_CAPTURE_ERROR_TYPE) {
                settleCapture(false, payload.message ?? "캡처 실패");
              }
            } catch {
              /* ignore */
            }
          }}
        />
      </View>
    );
  },
);
