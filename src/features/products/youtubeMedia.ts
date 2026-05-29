/** YouTube embed가 요구하는 Referer / origin (웹 서비스 도메인) */
export const YOUTUBE_WEBVIEW_BASE_URL = "https://zigtruck.co.kr";
export const YOUTUBE_WEBVIEW_REFERER = "https://zigtruck.co.kr/";

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function isMp4YoutubeUrl(youtubeUrl: string): boolean {
  return youtubeUrl.endsWith(".mp4") || youtubeUrl.includes(".mp4?");
}

export function extractYoutubeVideoId(youtubeUrl: string): string | null {
  const trimmed = youtubeUrl.trim();
  if (!trimmed || isMp4YoutubeUrl(trimmed)) {
    return null;
  }

  if (YOUTUBE_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const matchers = [
    /(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?.*v=|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of matchers) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  if (!trimmed.includes("://") && !trimmed.includes("/")) {
    return trimmed;
  }

  return null;
}

export function buildYoutubeEmbedSrc(videoId: string): string {
  const origin = encodeURIComponent(YOUTUBE_WEBVIEW_BASE_URL);
  return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=${origin}`;
}

export function buildYoutubeEmbedHtml(videoId: string): string {
  const embedSrc = buildYoutubeEmbedSrc(videoId);

  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1"
    />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
      }
      iframe {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
    </style>
  </head>
  <body>
    <iframe
      src="${embedSrc}"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </body>
</html>`;
}

export function buildMp4PlayerHtml(url: string): string {
  const safeSrc = url.replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1"
    />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html,
      body {
        width: 100%;
        height: 100%;
        background: #000;
      }
      video {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    </style>
  </head>
  <body>
    <video playsinline controls src="${safeSrc}"></video>
  </body>
</html>`;
}

export type YoutubePlayerWebSource =
  | { kind: "mp4"; html: string }
  | { kind: "youtube"; videoId: string; html: string; embedUri: string }
  | { kind: "invalid" };

export function buildYoutubePlayerWebSource(
  youtubeUrl: string,
): YoutubePlayerWebSource {
  const trimmed = youtubeUrl.trim();
  if (!trimmed) {
    return { kind: "invalid" };
  }

  if (isMp4YoutubeUrl(trimmed)) {
    return { kind: "mp4", html: buildMp4PlayerHtml(trimmed) };
  }

  const videoId = extractYoutubeVideoId(trimmed);
  if (!videoId) {
    return { kind: "invalid" };
  }

  return {
    kind: "youtube",
    videoId,
    html: buildYoutubeEmbedHtml(videoId),
    embedUri: buildYoutubeEmbedSrc(videoId),
  };
}
