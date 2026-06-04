import { Image, type ImageContentFit, type ImageProps } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ShimmerSkeleton } from "@/src/components/common/ShimmerSkeleton";

type Props = {
  source: ImageProps["source"];
  recyclingKey?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: ImageProps["style"];
  contentFit?: ImageContentFit;
  contentPosition?: ImageProps["contentPosition"];
  priority?: ImageProps["priority"];
  allowDownscaling?: boolean;
  className?: string;
};

/** 세션 내 한 번 로드된 URI는 스켈레톤을 다시 띄우지 않음 */
const loadedUriKeys = new Set<string>();

function resolveCacheKey(
  source: ImageProps["source"],
  recyclingKey?: string,
): string {
  if (recyclingKey) return recyclingKey;
  if (typeof source === "object" && source && "uri" in source && source.uri) {
    return String(source.uri);
  }
  return "static";
}

export function RemoteImageWithSkeleton({
  source,
  recyclingKey,
  style,
  imageStyle,
  contentFit = "cover",
  contentPosition,
  priority,
  allowDownscaling,
  className,
}: Props) {
  const cacheKey = resolveCacheKey(source, recyclingKey);
  const [isLoading, setIsLoading] = useState(
    () => !loadedUriKeys.has(cacheKey),
  );

  useEffect(() => {
    setIsLoading(!loadedUriKeys.has(cacheKey));
  }, [cacheKey]);

  const markLoaded = useCallback(() => {
    loadedUriKeys.add(cacheKey);
    setIsLoading(false);
  }, [cacheKey]);

  const handleLoadEnd = markLoaded;
  const handleError = useCallback(() => {
    loadedUriKeys.add(cacheKey);
    setIsLoading(false);
  }, [cacheKey]);

  return (
    <View
      style={[styles.container, style]}
      className={className}
      collapsable={false}
    >
      {isLoading ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, styles.skeletonLayer]}
        >
          <ShimmerSkeleton style={StyleSheet.absoluteFillObject} />
        </View>
      ) : null}
      <Image
        source={source}
        recyclingKey={recyclingKey}
        style={[
          imageStyle ?? StyleSheet.absoluteFillObject,
          isLoading ? styles.imageHidden : styles.imageVisible,
        ]}
        contentFit={contentFit}
        contentPosition={contentPosition}
        cachePolicy="memory-disk"
        transition={0}
        priority={priority}
        allowDownscaling={allowDownscaling}
        onLoad={markLoaded}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#D1D5DB",
  },
  skeletonLayer: {
    zIndex: 2,
  },
  imageHidden: {
    opacity: 0,
  },
  imageVisible: {
    opacity: 1,
  },
});
