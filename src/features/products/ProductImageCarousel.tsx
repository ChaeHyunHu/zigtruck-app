import { Image } from "expo-image";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import {
  buildInfiniteCarouselSlides,
  resolveLoopExtendedIndex,
} from "@/src/features/products/infiniteImageCarousel";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Props = {
  images: string[];
  height: number;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onPressImage?: (index: number) => void;
  imageRefreshKey?: number;
};

export function ProductImageCarousel({
  images,
  height,
  activeIndex,
  onActiveIndexChange,
  onPressImage,
  imageRefreshKey = 0,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const isLoopJumpingRef = useRef(false);
  const activeIndexRef = useRef(activeIndex);
  const lastSyncedIndexRef = useRef(activeIndex);

  const { slides, loopEnabled, toRealIndex, toExtendedIndex } = useMemo(
    () => buildInfiniteCarouselSlides(images),
    [images],
  );

  const initialContentOffset = useMemo(() => {
    const extendedIndex = loopEnabled
      ? toExtendedIndex(activeIndex)
      : activeIndex;
    return { x: extendedIndex * SCREEN_WIDTH, y: 0 };
  }, [activeIndex, loopEnabled, toExtendedIndex]);

  const carouselKey = useMemo(
    () => images.map((uri) => uri).join("|"),
    [images],
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const jumpToExtendedIndex = useCallback(
    (extendedIndex: number) => {
      isLoopJumpingRef.current = true;
      scrollRef.current?.scrollTo({
        x: extendedIndex * SCREEN_WIDTH,
        animated: false,
      });
      requestAnimationFrame(() => {
        isLoopJumpingRef.current = false;
      });
    },
    [],
  );

  const scrollToRealIndex = useCallback(
    (realIndex: number, animated = false) => {
      const safeIndex = Math.min(Math.max(realIndex, 0), Math.max(images.length - 1, 0));
      const extendedIndex = toExtendedIndex(safeIndex);
      scrollRef.current?.scrollTo({
        x: extendedIndex * SCREEN_WIDTH,
        animated,
      });
    },
    [images.length, toExtendedIndex],
  );

  // 루프 모드에서 x=0은 마지막 이미지 클론이므로, 마운트·이미지 변경 시 항상 실제 인덱스 위치로 이동
  useEffect(() => {
    if (!images.length) return;
    const frame = requestAnimationFrame(() => {
      scrollToRealIndex(activeIndex, false);
      lastSyncedIndexRef.current = activeIndex;
    });
    return () => cancelAnimationFrame(frame);
  }, [carouselKey, activeIndex, scrollToRealIndex]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isLoopJumpingRef.current || images.length === 0) return;

      const extendedIndex = Math.round(
        event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
      );

      if (loopEnabled) {
        const loopTarget = resolveLoopExtendedIndex(extendedIndex, images.length);
        if (loopTarget !== null) {
          const realIndex = toRealIndex(extendedIndex);
          activeIndexRef.current = realIndex;
          lastSyncedIndexRef.current = realIndex;
          onActiveIndexChange(realIndex);
          jumpToExtendedIndex(loopTarget);
          return;
        }
      }

      const realIndex = toRealIndex(extendedIndex);
      if (realIndex !== activeIndexRef.current) {
        activeIndexRef.current = realIndex;
        lastSyncedIndexRef.current = realIndex;
        onActiveIndexChange(realIndex);
      }
    },
    [images.length, jumpToExtendedIndex, loopEnabled, onActiveIndexChange, toRealIndex],
  );

  if (!images.length) return <View style={{ width: SCREEN_WIDTH, height }} />;

  return (
    <ScrollView
      key={carouselKey}
      ref={scrollRef}
      horizontal
      pagingEnabled
      nestedScrollEnabled
      removeClippedSubviews={false}
      showsHorizontalScrollIndicator={false}
      contentOffset={initialContentOffset}
      onMomentumScrollEnd={handleScrollEnd}
      onScrollEndDrag={handleScrollEnd}
      scrollEventThrottle={16}
    >
      {slides.map((uri, slideIndex) => {
        const realIndex = toRealIndex(slideIndex);
        return (
          <Pressable
            key={`${slideIndex}-${imageRefreshKey}`}
            collapsable={false}
            style={{ width: SCREEN_WIDTH, height }}
            onPress={() => onPressImage?.(realIndex)}
          >
            <Image
              source={{ uri }}
              style={{ width: SCREEN_WIDTH, height, backgroundColor: "#f3f4f6" }}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`carousel-${carouselKey}-${slideIndex}-${imageRefreshKey}`}
              transition={0}
              allowDownscaling
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
};
