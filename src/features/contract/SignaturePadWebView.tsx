import React, { useMemo, type RefObject } from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";

const WEBVIEW_BASE_URL = "https://zigtruck.io";

type Props = {
  onStrokeEnd: (dataUrl: string | null) => void;
  webViewRef?: RefObject<WebView | null>;
  initialDataUrl?: string | null;
};

const SIGNATURE_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  html, body {
    margin: 0; padding: 0; width: 100%; height: 100%;
    touch-action: none; overflow: hidden;
    -webkit-user-select: none; user-select: none;
  }
  #wrap { width: 100%; height: 130px; padding: 0; }
  canvas {
    display: block; width: 100%; height: 130px;
    background: #f5f5f5; border: 1px solid #dcdcdc; border-radius: 10px;
    touch-action: none;
  }
</style>
</head>
<body>
<div id="wrap"><canvas id="pad"></canvas></div>
<script>
  const canvas = document.getElementById('pad');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let hasStroke = false;
  let ratio = 1;
  let pendingImage = null;

  function setupCanvas(preserve) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      requestAnimationFrame(function() { setupCanvas(preserve); });
      return;
    }
    const prev = preserve && hasStroke ? canvas.toDataURL('image/png') : null;
    ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111111';
    if (prev) {
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        hasStroke = true;
      };
      img.src = prev;
    } else if (pendingImage) {
      loadImage(pendingImage);
      pendingImage = null;
    }
  }

  function loadImage(src) {
    const rect = canvas.getBoundingClientRect();
    const img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      hasStroke = true;
      notify();
    };
    img.src = src;
  }

  window.loadSignatureImage = function(src) {
    if (!src) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2) {
      pendingImage = src;
      return;
    }
    loadImage(src);
  };

  function notify() {
    if (!window.ReactNativeWebView) return;
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        hasStroke: hasStroke,
        dataUrl: hasStroke ? canvas.toDataURL('image/png') : null,
      }));
    } catch (e) {}
  }

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = (e.touches && e.touches.length) ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    e.stopPropagation();
    drawing = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.05, p.y + 0.05);
    ctx.stroke();
  }

  function move(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!drawing) return;
    hasStroke = true;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function end(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!drawing) return;
    drawing = false;
    notify();
  }

  function clearPad() {
    hasStroke = false;
    pendingImage = null;
    setupCanvas(false);
    notify();
  }

  window.clearSignature = clearPad;
  window.setupSignaturePad = function() { setupCanvas(false); };

  setupCanvas(false);
  window.addEventListener('resize', function() { setupCanvas(true); });

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end, { passive: false });
  canvas.addEventListener('touchcancel', end, { passive: false });
</script>
</body>
</html>`;

export function SignaturePadWebView({
  onStrokeEnd,
  webViewRef,
  initialDataUrl,
}: Props) {
  const source = useMemo(
    () => ({
      html: SIGNATURE_HTML,
      baseUrl: WEBVIEW_BASE_URL,
    }),
    [],
  );

  const loadInitial = () => {
    webViewRef?.current?.injectJavaScript(
      "window.setupSignaturePad && window.setupSignaturePad(); true;",
    );
    if (initialDataUrl) {
      webViewRef?.current?.injectJavaScript(
        `(function(){ window.loadSignatureImage && window.loadSignatureImage(${JSON.stringify(initialDataUrl)}); })(); true;`,
      );
    }
  };

  return (
    <View className="h-[130px] w-full overflow-hidden rounded-[10px]">
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={source}
        javaScriptEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled={false}
        setSupportMultipleWindows={false}
        androidLayerType={Platform.OS === "android" ? "hardware" : undefined}
        style={{ flex: 1, backgroundColor: "#f5f5f5", opacity: 0.99 }}
        onLoadEnd={loadInitial}
        onMessage={(event) => {
          try {
            const payload = JSON.parse(event.nativeEvent.data) as {
              hasStroke?: boolean;
              dataUrl?: string | null;
            };
            onStrokeEnd(payload.hasStroke ? payload.dataUrl ?? null : null);
          } catch {
            /* ignore */
          }
        }}
      />
    </View>
  );
}

export function clearSignaturePad(webViewRef: React.RefObject<WebView | null>) {
  webViewRef.current?.injectJavaScript(
    "window.clearSignature && window.clearSignature(); true;",
  );
}
