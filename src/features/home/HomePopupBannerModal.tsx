import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { patchBanner } from "@/src/api/public";
import { prefetchPopupBannerImages } from "@/src/features/home/homeBannerCache";
import { navigateBannerLink } from "@/src/features/home/navigateBannerLink";
import type { BannerItem } from "@/src/features/home/types";
import {
  beginHomePopupOpenRequest,
  invalidateHomePopupOpenRequests,
  isHomePopupOpenRequestActive,
  markHomePopupDismissedSession,
  setHomePopupHideToday,
  shouldShowHomePopupToday,
} from "@/src/features/home/homePopupStorage";

const SCREEN = Dimensions.get("window");
const POPUP_IMAGE_MAX_HEIGHT = Math.round(SCREEN.height * 0.48);

type Props = {
  banners: BannerItem[];
};

export function HomePopupBannerModal({ banners }: Props) {
  const router = useRouter();
  const listRef = useRef<FlatList<BannerItem>>(null);
  const isLoopJumpingRef = useRef(false);
  const [visible, setVisible] = useState(false);

  const popupBanners = useMemo(
    () =>
      banners
        .filter(
          (banner) =>
            banner.bannerLocation?.code === "HOME_POP_UP" &&
            banner.display !== false &&
            Boolean(banner.contents?.trim()),
        )
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
    [banners],
  );

  useEffect(() => {
    if (popupBanners.length === 0) return;
    void prefetchPopupBannerImages(popupBanners);
  }, [popupBanners]);

  const popupWidth = Math.min(SCREEN.width - 48, 360);

  const extendedBanners = useMemo(() => {
    if (popupBanners.length <= 1) return popupBanners;
    return [
      popupBanners[popupBanners.length - 1],
      ...popupBanners,
      popupBanners[0],
    ];
  }, [popupBanners]);

  const initialListIndex = popupBanners.length > 1 ? 1 : 0;
  const [listIndex, setListIndex] = useState(initialListIndex);
  const listIndexRef = useRef(initialListIndex);

  // 가로 스크롤 위치. 이 값에 높이를 연동해 스와이프와 동시에 모달 높이가 따라가도록 한다.
  const scrollX = useRef(
    new Animated.Value(initialListIndex * popupWidth),
  ).current;
  const onScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false },
      ),
    [scrollX],
  );

  // 배너 이미지의 원본 비율로 계산한 표시 높이 (박스보다 크면 세로 스크롤됨)
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({});
  const handleImageLoad = useCallback(
    (id: string, event: { source?: { width?: number; height?: number } }) => {
      const src = event?.source;
      if (!src?.width || !src?.height) return;
      const displayHeight = Math.round((popupWidth * src.height) / src.width);
      setImageHeights((prev) =>
        prev[id] === displayHeight ? prev : { ...prev, [id]: displayHeight },
      );
    },
    [popupWidth],
  );

  const activePageIndex =
    popupBanners.length <= 1
      ? 0
      : (listIndex - 1 + popupBanners.length) % popupBanners.length;

  // 배너별 표시 높이: 긴 이미지는 max-height로 제한(내부 스크롤), 짧은 이미지는 그 높이에 맞춘다.
  const bannerDisplayHeight = useCallback(
    (banner?: BannerItem) => {
      const h = banner ? imageHeights[String(banner.id)] : undefined;
      return h ? Math.min(h, POPUP_IMAGE_MAX_HEIGHT) : POPUP_IMAGE_MAX_HEIGHT;
    },
    [imageHeights],
  );

  // 스크롤 위치에 따라 두 인접 배너 높이 사이를 보간 → 스와이프와 동시에 높이가 따라가서
  // 별도의 "줄었다 늘었다" 리사이즈 과정이 눈에 보이지 않는다.
  const animatedContainerHeight = useMemo(() => {
    if (extendedBanners.length < 2) return null;
    const inputRange = extendedBanners.map((_, i) => i * popupWidth);
    const outputRange = extendedBanners.map((banner) =>
      bannerDisplayHeight(banner),
    );
    return scrollX.interpolate({
      inputRange,
      outputRange,
      extrapolate: "clamp",
    });
  }, [extendedBanners, popupWidth, bannerDisplayHeight, scrollX]);

  const staticContainerHeight = bannerDisplayHeight(popupBanners[0]);

  /** 온보딩 완료 후 홈 탭에 들어왔을 때만 노출 (앱 최초 진입·온보딩 중 프리로드 시 미노출) */
  useFocusEffect(
    useCallback(() => {
      if (popupBanners.length === 0) return;

      const requestId = beginHomePopupOpenRequest();
      let mounted = true;

      void (async () => {
        const show = await shouldShowHomePopupToday();
        if (!mounted || !show || !isHomePopupOpenRequestActive(requestId)) return;

        await prefetchPopupBannerImages(popupBanners);
        if (!mounted || !isHomePopupOpenRequestActive(requestId)) return;

        setVisible(true);
      })();

      return () => {
        mounted = false;
        invalidateHomePopupOpenRequests();
      };
    }, [popupBanners]),
  );

  useEffect(() => {
    if (!visible) return;

    const nextInitial = popupBanners.length > 1 ? 1 : 0;
    setListIndex(nextInitial);
    listIndexRef.current = nextInitial;

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: nextInitial * popupWidth,
        animated: false,
      });
    });
  }, [popupBanners.length, popupWidth, visible]);

  useEffect(() => {
    listIndexRef.current = listIndex;
  }, [listIndex]);

  const close = useCallback(() => {
    markHomePopupDismissedSession();
    setVisible(false);
  }, []);

  const hideTodayAndClose = useCallback(() => {
    markHomePopupDismissedSession();
    void setHomePopupHideToday();
    setVisible(false);
  }, []);

  const onPressBanner = useCallback(
    (item: BannerItem) => {
      patchBanner(item.id).catch(() => undefined);
      if (!item.link?.trim()) return;
      close();
      navigateBannerLink(item, (href) => router.push(href));
    },
    [close, router],
  );

  const jumpToIndex = useCallback(
    (index: number) => {
      isLoopJumpingRef.current = true;
      listRef.current?.scrollToOffset({
        offset: index * popupWidth,
        animated: false,
      });
      listIndexRef.current = index;
      setListIndex(index);
      requestAnimationFrame(() => {
        isLoopJumpingRef.current = false;
      });
    },
    [popupWidth],
  );

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isLoopJumpingRef.current) return;

    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / popupWidth);
    const count = popupBanners.length;

    if (count <= 1) {
      setListIndex(nextIndex);
      listIndexRef.current = nextIndex;
      return;
    }

    if (nextIndex === 0) {
      jumpToIndex(count);
      return;
    }

    if (nextIndex === count + 1) {
      jumpToIndex(1);
      return;
    }

    setListIndex(nextIndex);
    listIndexRef.current = nextIndex;
  };

  if (popupBanners.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Pressable
          className="absolute inset-0 bg-black/60"
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="배너 닫기"
        />
        <View
          className="z-10 overflow-hidden rounded-2xl bg-white"
          style={{ width: popupWidth }}
        >
          <Animated.View
            style={{
              width: popupWidth,
              height: animatedContainerHeight ?? staticContainerHeight,
              overflow: "hidden",
            }}
          >
            <FlatList
              ref={listRef}
              data={extendedBanners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={initialListIndex}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              onScroll={onScroll}
              scrollEventThrottle={16}
              style={{ height: POPUP_IMAGE_MAX_HEIGHT }}
              onMomentumScrollEnd={onMomentumEnd}
              onScrollToIndexFailed={(info) => {
                listRef.current?.scrollToOffset({
                  offset: info.index * popupWidth,
                  animated: false,
                });
              }}
              getItemLayout={(_, index) => ({
                length: popupWidth,
                offset: popupWidth * index,
                index,
              })}
              renderItem={({ item }) => {
                const imageHeight =
                  imageHeights[String(item.id)] ?? POPUP_IMAGE_MAX_HEIGHT;
                return (
                  <ScrollView
                    style={{ width: popupWidth, height: POPUP_IMAGE_MAX_HEIGHT }}
                    showsVerticalScrollIndicator
                    nestedScrollEnabled
                    bounces={false}
                  >
                    <Pressable
                      style={{ width: popupWidth, height: imageHeight }}
                      onPress={() => void onPressBanner(item)}
                    >
                      <Image
                        source={{ uri: item.contents }}
                        recyclingKey={String(item.id)}
                        cachePolicy="memory-disk"
                        priority="high"
                        style={{ width: popupWidth, height: imageHeight }}
                        contentFit={
                          imageHeights[String(item.id)] ? "contain" : "cover"
                        }
                        transition={0}
                        onLoad={(event) =>
                          handleImageLoad(String(item.id), event)
                        }
                      />
                    </Pressable>
                  </ScrollView>
                );
              }}
            />

            {popupBanners.length > 1 ? (
              <View
                pointerEvents="none"
                className="absolute right-2 top-2 rounded-full bg-black/45 px-2.5 py-1"
              >
                <Text className="text-[12px] font-semibold text-white">
                  {activePageIndex + 1} / {popupBanners.length}
                </Text>
              </View>
            ) : null}
          </Animated.View>

          <View className="flex-row border-t border-gray200">
            <Pressable
              onPress={hideTodayAndClose}
              className="h-12 flex-1 items-center justify-center"
            >
              <Text className="text-[15px] text-gray700">오늘 하루 보지 않기</Text>
            </Pressable>
            <View className="w-px bg-gray200" />
            <Pressable onPress={close} className="h-12 flex-1 items-center justify-center">
              <Text className="text-[15px] font-semibold text-primary">닫기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
