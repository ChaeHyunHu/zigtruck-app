import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  buildInfiniteCarouselSlides,
  resolveLoopExtendedIndex,
} from "@/src/features/products/infiniteImageCarousel";
import { ProductImageViewerZoomableImage } from "@/src/features/products/ProductImageViewerZoomableImage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

type ProductImageViewerProps = {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: (index: number) => void;
};

export function ProductImageViewer({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: ProductImageViewerProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const isLoopJumpingRef = useRef(false);
  const [displayIndex, setDisplayIndex] = useState(initialIndex);
  const [activeExtendedIndex, setActiveExtendedIndex] = useState(0);
  const [pagerScrollEnabled, setPagerScrollEnabled] = useState(true);

  const { slides, loopEnabled, toRealIndex, toExtendedIndex } = useMemo(
    () => buildInfiniteCarouselSlides(images),
    [images],
  );

  const jumpToExtendedIndex = useCallback((extendedIndex: number) => {
    isLoopJumpingRef.current = true;
    scrollRef.current?.scrollTo({
      x: extendedIndex * SCREEN_WIDTH,
      animated: false,
    });
    setActiveExtendedIndex(extendedIndex);
    requestAnimationFrame(() => {
      isLoopJumpingRef.current = false;
    });
  }, []);

  const scrollToRealIndex = useCallback(
    (realIndex: number) => {
      const safeIndex = Math.min(Math.max(realIndex, 0), Math.max(images.length - 1, 0));
      jumpToExtendedIndex(toExtendedIndex(safeIndex));
      setDisplayIndex(safeIndex);
    },
    [images.length, jumpToExtendedIndex, toExtendedIndex],
  );

  useEffect(() => {
    if (!visible || images.length === 0) return;
    setPagerScrollEnabled(true);
    scrollToRealIndex(initialIndex);
  }, [visible, initialIndex, images, scrollToRealIndex]);

  const handleZoomChange = useCallback((zoomed: boolean) => {
    setPagerScrollEnabled(!zoomed);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!pagerScrollEnabled) return;
      const extendedIndex = Math.round(
        event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
      );
      setActiveExtendedIndex(extendedIndex);
    },
    [pagerScrollEnabled],
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isLoopJumpingRef.current || images.length === 0 || !pagerScrollEnabled) return;

      const extendedIndex = Math.round(
        event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
      );
      setActiveExtendedIndex(extendedIndex);

      if (loopEnabled) {
        const loopTarget = resolveLoopExtendedIndex(extendedIndex, images.length);
        if (loopTarget !== null) {
          const realIndex = toRealIndex(extendedIndex);
          setDisplayIndex(realIndex);
          jumpToExtendedIndex(loopTarget);
          return;
        }
      }

      setDisplayIndex(toRealIndex(extendedIndex));
    },
    [images.length, jumpToExtendedIndex, loopEnabled, pagerScrollEnabled, toRealIndex],
  );

  const handleClose = useCallback(() => {
    setPagerScrollEnabled(true);
    onClose(displayIndex);
  }, [displayIndex, onClose]);

  if (!visible || images.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-black">
          <Pressable
            onPress={handleClose}
            hitSlop={12}
            className="absolute right-4 z-10 rounded-full bg-black/50 p-2"
            style={{ top: insets.top + 8 }}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            scrollEnabled={pagerScrollEnabled}
            showsHorizontalScrollIndicator={false}
            removeClippedSubviews={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScrollEnd}
            onScrollEndDrag={handleScrollEnd}
            scrollEventThrottle={16}
          >
            {slides.map((uri, slideIndex) => {
              const realIndex = toRealIndex(slideIndex);
              return (
                <View
                  key={`${uri}-${slideIndex}`}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                >
                  <ProductImageViewerZoomableImage
                    uri={uri}
                    isActive={slideIndex === activeExtendedIndex}
                    recyclingKey={`viewer-${uri}-${slideIndex}`}
                    onZoomChange={handleZoomChange}
                  />
                </View>
              );
            })}
          </ScrollView>

          <View
            className="absolute left-0 right-0 items-center"
            style={{ bottom: insets.bottom + 24 }}
            pointerEvents="none"
          >
            <View className="rounded-full bg-black/60 px-3 py-1">
              <Text className="text-[14px] font-semibold text-white">
                {displayIndex + 1}/{images.length}
              </Text>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
