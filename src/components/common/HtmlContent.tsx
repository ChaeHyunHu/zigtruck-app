import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  html?: string | null;
  className?: string;
};

export function HtmlContent({ html, className = "" }: Props) {
  const [height, setHeight] = useState(320);
  const source = useMemo(() => {
    const body = html?.trim() || "<p>내용이 없습니다.</p>";
    return {
      html: `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:0;padding:0;color:#121212;font-size:15px;line-height:1.65;word-break:break-word} img{max-width:100%;height:auto} p{margin:0 0 12px}a{color:#397AFF}</style></head><body>${body}</body></html>`,
    };
  }, [html]);

  return (
    <View className={className} style={{ height }}>
      <WebView
        originWhitelist={["*"]}
        source={source}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        onMessage={(event) => {
          const next = Number(event.nativeEvent.data);
          if (Number.isFinite(next) && next > 0) {
            setHeight(next);
          }
        }}
        injectedJavaScript={`
          setTimeout(function () {
            window.ReactNativeWebView.postMessage(String(document.body.scrollHeight));
          }, 80);
          true;
        `}
      />
    </View>
  );
}
