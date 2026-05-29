import React, { useMemo } from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";

import {
  parseDaumPostcodeData,
  type DaumAddressResult,
} from "@/src/features/drive/utils/parseDaumPostcodeData";

export type { DaumAddressResult };

type Props = {
  onComplete: (result: DaumAddressResult) => void;
};

/**
 * baseUrl 필수: file:// 에서 iframe postMessage origin 오류로
 * 검색 결과(도로명/지번) 클릭 시 oncomplete가 동작하지 않음
 * @see https://github.com/daumPostcode/QnA/issues/642
 */
const POSTCODE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
  <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
  <style>
    html, body { width: 100%; height: 100%; margin: 0; padding: 0; }
    #postcode-container { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="postcode-container"></div>
  <script>
    function initPostcode() {
      new daum.Postcode({
        oncomplete: function(data) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(data));
          }
        },
        width: '100%',
        height: '100%',
        animation: false,
        hideMapBtn: true,
      }).embed(document.getElementById('postcode-container'));
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPostcode);
    } else {
      initPostcode();
    }
  </script>
</body>
</html>`;

const POSTCODE_BASE_URL = "https://postcode.map.daum.net";

export function DaumPostcodeWebView({ onComplete }: Props) {
  const source = useMemo(
    () => ({
      html: POSTCODE_HTML,
      baseUrl: POSTCODE_BASE_URL,
    }),
    [],
  );

  return (
    <View className="flex-1 bg-white">
      <WebView
        originWhitelist={["*"]}
        source={source}
        javaScriptEnabled
        domStorageEnabled
        nestedScrollEnabled
        setSupportMultipleWindows={Platform.OS === "android"}
        mixedContentMode="compatibility"
        style={{ flex: 1 }}
        onMessage={(event) => {
          try {
            const raw = JSON.parse(event.nativeEvent.data) as Record<string, unknown>;
            const parsed = parseDaumPostcodeData(raw);
            if (parsed) onComplete(parsed);
          } catch {
            /* ignore */
          }
        }}
      />
    </View>
  );
}
