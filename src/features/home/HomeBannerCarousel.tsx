import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";

import { patchBanner } from "@/src/api/public";
import { navigateBannerLink } from "@/src/features/home/navigateBannerLink";
import { BannerItem } from "@/src/features/home/types";

type Props = {
  banners: BannerItem[];
};

type BannerSlideProps = {
  item: BannerItem;
  screenWidth: number;
  onPress: (item: BannerItem) => void;
};

const BannerSlide = React.memo(function BannerSlide({
  item,
  screenWidth,
  onPress,
}: BannerSlideProps) {
  return (
    <Pressable
      className="px-3"
      style={{ width: screenWidth }}
      onPress={() => onPress(item)}
    >
      <Image
        source={{ uri: item.contents }}
        recyclingKey={String(item.id)}
        cachePolicy="memory-disk"
        className="w-full rounded-xl bg-gray100"
        style={{ aspectRatio: 300 / 128 }}
        contentFit="cover"
        transition={0}
      />
    </Pressable>
  );
});

export function HomeBannerCarousel({ banners }: Props) {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const listRef = useRef<FlatList<BannerItem>>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceBanners = useMemo(
    () => banners.filter((b) => !!b.contents),
    [banners],
  );
  const extendedBanners = useMemo(() => {
    if (sourceBanners.length <= 1) return sourceBanners;
    return [
      sourceBanners[sourceBanners.length - 1],
      ...sourceBanners,
      sourceBanners[0],
    ];
  }, [sourceBanners]);
  const initialIndex = sourceBanners.length > 1 ? 1 : 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const currentIndexRef = useRef(initialIndex);
  const isLoopJumpingRef = useRef(false);

  useEffect(() => {
    sourceBanners.forEach((banner) => {
      if (banner.contents) {
        Image.prefetch(banner.contents).catch(() => undefined);
      }
    });
  }, [sourceBanners]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const nextInitialIndex = sourceBanners.length > 1 ? 1 : 0;
    setCurrentIndex(nextInitialIndex);
    currentIndexRef.current = nextInitialIndex;
    setIsAutoPlayEnabled(true);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: nextInitialIndex * screenWidth,
        animated: false,
      });
    });
  }, [screenWidth, sourceBanners.length]);

  useEffect(() => {
    if (!isAutoPlayEnabled || sourceBanners.length <= 1) return;

    const timer = setInterval(() => {
      const next = currentIndexRef.current + 1;
      listRef.current?.scrollToOffset({
        offset: next * screenWidth,
        animated: true,
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlayEnabled, screenWidth, sourceBanners.length]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  const pauseAutoPlay = () => {
    setIsAutoPlayEnabled(false);
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
  };

  const resumeAutoPlay = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      setIsAutoPlayEnabled(true);
    }, 2500);
  };

  const onPressBanner = useCallback(
    (item: BannerItem) => {
      patchBanner(item.id).catch(() => undefined);
      if (!item.link?.trim()) return;
      navigateBannerLink(item, (href) => router.push(href));
    },
    [router],
  );

  const jumpToIndex = useCallback(
    (index: number) => {
      isLoopJumpingRef.current = true;
      listRef.current?.scrollToOffset({
        offset: index * screenWidth,
        animated: false,
      });
      currentIndexRef.current = index;
      setCurrentIndex(index);
      requestAnimationFrame(() => {
        isLoopJumpingRef.current = false;
      });
    },
    [screenWidth],
  );

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (isLoopJumpingRef.current) return;

    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth,
    );
    if (sourceBanners.length <= 1) {
      setCurrentIndex(nextIndex);
      currentIndexRef.current = nextIndex;
      resumeAutoPlay();
      return;
    }

    if (nextIndex === 0) {
      jumpToIndex(sourceBanners.length);
      resumeAutoPlay();
      return;
    }

    if (nextIndex === sourceBanners.length + 1) {
      jumpToIndex(1);
      resumeAutoPlay();
      return;
    }

    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    resumeAutoPlay();
  };

  if (!sourceBanners.length) return null;

  const activeDotIndex =
    sourceBanners.length <= 1
      ? 0
      : (currentIndex - 1 + sourceBanners.length) % sourceBanners.length;

  return (
    <View>
      <FlatList
        ref={listRef}
        data={extendedBanners}
        initialScrollIndex={initialIndex}
        horizontal
        pagingEnabled
        removeClippedSubviews={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onScrollBeginDrag={pauseAutoPlay}
        onTouchStart={pauseAutoPlay}
        onScrollEndDrag={resumeAutoPlay}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.index * screenWidth,
            animated: false,
          });
        }}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <BannerSlide
            item={item}
            screenWidth={screenWidth}
            onPress={onPressBanner}
          />
        )}
      />
      <View className="mb-1.5 mt-2.5 flex-row justify-center">
        {sourceBanners.map((item, index) => (
          <View
            key={item.id}
            className={`mx-[3px] h-1.5 w-1.5 rounded-full ${activeDotIndex === index ? "bg-primary" : "bg-gray300"}`}
          />
        ))}
      </View>
    </View>
  );
}
