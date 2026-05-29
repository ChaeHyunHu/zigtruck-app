import React, { memo, useCallback, useMemo, useState } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { WebView } from "react-native-webview";
import YoutubePlayer from "react-native-youtube-iframe";

import {
  buildMp4PlayerHtml,
  buildYoutubeEmbedHtml,
  extractYoutubeVideoId,
  isMp4YoutubeUrl,
  YOUTUBE_WEBVIEW_BASE_URL,
  YOUTUBE_WEBVIEW_REFERER,
} from "@/src/features/products/youtubeMedia";

type Props = {
  youtubeUrl: string;
};

const HORIZONTAL_PADDING = 32;

export const ProductYoutubePlayer = memo(function ProductYoutubePlayer({
  youtubeUrl,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const playerWidth = windowWidth - HORIZONTAL_PADDING;
  const playerHeight = Math.round((playerWidth * 9) / 16);
  const [useFallbackEmbed, setUseFallbackEmbed] = useState(false);

  const trimmed = youtubeUrl.trim();
  const isMp4 = isMp4YoutubeUrl(trimmed);
  const videoId = useMemo(
    () => (isMp4 ? null : extractYoutubeVideoId(trimmed)),
    [isMp4, trimmed],
  );

  const onPlayerError = useCallback(() => {
    setUseFallbackEmbed(true);
  }, []);

  if (!trimmed) {
    return null;
  }

  if (isMp4) {
    return (
      <>
        <View className="h-2 bg-gray100" />
        <View className="p-4">
          <View
            className="overflow-hidden rounded-lg bg-black"
            style={{ width: playerWidth, height: playerHeight }}
          >
            <WebView
              source={{
                html: buildMp4PlayerHtml(trimmed),
                baseUrl: YOUTUBE_WEBVIEW_BASE_URL,
              }}
              style={{
                width: playerWidth,
                height: playerHeight,
                backgroundColor: "#000",
              }}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              androidLayerType="hardware"
            />
          </View>
        </View>
      </>
    );
  }

  if (!videoId) {
    return null;
  }

  if (useFallbackEmbed) {
    return (
      <>
        <View className="h-2 bg-gray100" />
        <View className="p-4">
          <View
            className="overflow-hidden rounded-lg bg-black"
            style={{ width: playerWidth, height: playerHeight }}
          >
            <WebView
              source={{
                html: buildYoutubeEmbedHtml(videoId),
                baseUrl: YOUTUBE_WEBVIEW_BASE_URL,
                headers: {
                  Referer: YOUTUBE_WEBVIEW_REFERER,
                },
              }}
              style={{
                width: playerWidth,
                height: playerHeight,
                backgroundColor: "#000",
              }}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              thirdPartyCookiesEnabled
              sharedCookiesEnabled
              androidLayerType="hardware"
              mixedContentMode="always"
              originWhitelist={["*"]}
              setSupportMultipleWindows={false}
            />
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <View className="h-2 bg-gray100" />
      <View className="p-4">
        <View
          className="overflow-hidden rounded-lg bg-black"
          style={{ width: playerWidth, height: playerHeight }}
        >
          <YoutubePlayer
            height={playerHeight}
            width={playerWidth}
            videoId={videoId}
            useLocalHTML
            baseUrlOverride={YOUTUBE_WEBVIEW_BASE_URL}
            forceAndroidAutoplay={Platform.OS === "android"}
            onError={onPlayerError}
            webViewProps={{
              androidLayerType: "hardware",
              allowsInlineMediaPlayback: true,
              mediaPlaybackRequiresUserAction: false,
              javaScriptEnabled: true,
              domStorageEnabled: true,
              thirdPartyCookiesEnabled: true,
              sharedCookiesEnabled: true,
            }}
            webViewStyle={{
              opacity: 0.99,
            }}
            initialPlayerParams={{
              preventFullScreen: false,
              rel: false,
            }}
          />
        </View>
      </View>
    </>
  );
});
