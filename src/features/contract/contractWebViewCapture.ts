/** WebView 계약서 HTML → JPEG(base64) 캡처 (html2canvas) */
export const CONTRACT_CAPTURE_MESSAGE_TYPE = "contractCapture";
export const CONTRACT_CAPTURE_ERROR_TYPE = "contractCaptureError";

export const CONTRACT_CAPTURE_SCRIPT = `
(function() {
  function postError(message) {
    if (!window.ReactNativeWebView) return;
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: '${CONTRACT_CAPTURE_ERROR_TYPE}',
      message: message || 'capture failed',
    }));
  }
  function postSuccess(dataUrl) {
    if (!window.ReactNativeWebView) return;
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: '${CONTRACT_CAPTURE_MESSAGE_TYPE}',
      dataUrl: dataUrl,
    }));
  }
  function capture() {
    try {
      html2canvas(document.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      }).then(function(canvas) {
        postSuccess(canvas.toDataURL('image/jpeg', 0.92));
      }).catch(function(err) {
        postError(String(err && err.message ? err.message : err));
      });
    } catch (e) {
      postError(String(e));
    }
  }
  function loadLib() {
    if (window.html2canvas) {
      capture();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.onload = capture;
    script.onerror = function() { postError('html2canvas load failed'); };
    document.head.appendChild(script);
  }
  loadLib();
})();
true;
`;
