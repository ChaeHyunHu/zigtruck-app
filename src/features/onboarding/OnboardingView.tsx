import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appColors } from "@/src/constants/colors";

import { ONBOARDING_SLIDES, type OnboardingSlide } from "./onboardingConstants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const LAST_INDEX = ONBOARDING_SLIDES.length - 1;

const ILLUSTRATION_WIDTH = Math.min(SCREEN_WIDTH * 0.72, 300);
const ILLUSTRATION_HEIGHT = Math.min(SCREEN_HEIGHT * 0.32, 280);

type OnboardingViewProps = {
  onComplete: () => void;
};

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setIndex(first.index);
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const goNext = useCallback(() => {
    if (index >= LAST_INDEX) {
      onComplete();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, [index, onComplete]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const next = Math.round(x / SCREEN_WIDTH);
      setIndex(Math.min(Math.max(next, 0), LAST_INDEX));
    },
    [],
  );

  const renderItem: ListRenderItem<OnboardingSlide> = useCallback(({ item }) => {
    return (
      <View
        style={{ width: SCREEN_WIDTH, flex: 1 }}
        className="items-center justify-center px-6"
      >
        <View className="w-full max-w-[320px] items-center">
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: ILLUSTRATION_WIDTH, height: ILLUSTRATION_HEIGHT }}
            contentFit="contain"
            accessibilityLabel={item.title}
          />
          <View className="mt-8 w-full items-center px-1">
            <Text className="text-center text-[28px] font-bold leading-[34px] text-gray900">
              {item.title}
            </Text>
            {item.descLines.map((line) => (
              <Text
                key={line}
                className="mt-1 text-center text-[16px] leading-[24px] text-gray800"
              >
                {line}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  }, []);

  const bottomInset = Math.max(insets.bottom, 20);

  return (
    <View className="flex-1 bg-white">
      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.title}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={({ index: targetIndex }) => {
          listRef.current?.scrollToOffset({
            offset: SCREEN_WIDTH * targetIndex,
            animated: true,
          });
        }}
        getItemLayout={(_, i) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * i,
          index: i,
        })}
      />

      <View className="items-center pb-6 pt-2">
        <View className="flex-row items-center justify-center">
          {ONBOARDING_SLIDES.map((_, i) => (
            <Pressable
              key={i}
              className="mx-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: i === index ? "#737373" : "#BEBEBE" }}
              onPress={() => listRef.current?.scrollToIndex({ index: i, animated: true })}
              accessibilityRole="button"
              accessibilityLabel={`${i + 1}번째 온보딩`}
            />
          ))}
        </View>
      </View>

      <View
        className="px-4"
        style={{ paddingBottom: bottomInset + 8 }}
      >
        <Pressable
          onPress={() => {
            if (index >= LAST_INDEX) {
              onComplete();
            } else {
              goNext();
            }
          }}
          className="h-[52px] w-full items-center justify-center rounded-xl"
          style={{ backgroundColor: appColors.primary }}
        >
          <Text className="text-[16px] font-bold text-white">
            {index >= LAST_INDEX ? "홈으로 가기" : "다음"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
