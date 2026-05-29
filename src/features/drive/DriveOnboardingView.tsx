import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
  type ListRenderItem,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appColors } from "@/src/constants/colors";
import {
  DRIVE_ONBOARDING_SLIDES,
  type DriveOnboardingSlide,
} from "@/src/features/drive/driveConstants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const LAST_INDEX = DRIVE_ONBOARDING_SLIDES.length - 1;

const ILLUSTRATION_WIDTH = 248;
const ILLUSTRATION_HEIGHT = Math.min(SCREEN_HEIGHT * 0.38, 316);

type Props = {
  onComplete: () => void;
};

export function DriveOnboardingView({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<DriveOnboardingSlide>>(null);
  const [index, setIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setIndex(first.index);
    },
  ).current;

  const goNext = useCallback(() => {
    if (index >= LAST_INDEX) {
      onComplete();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, [index, onComplete]);

  const renderItem: ListRenderItem<DriveOnboardingSlide> = useCallback(
    ({ item }) => (
      <Pressable
        style={{ width: SCREEN_WIDTH, flex: 1 }}
        className="items-center justify-center px-6"
        onPress={goNext}
      >
        <View className="w-full max-w-[320px] items-center">
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: ILLUSTRATION_WIDTH, height: ILLUSTRATION_HEIGHT }}
            contentFit="contain"
          />
          <View className="mt-8 w-full items-center">
            <Text className="text-center text-[28px] font-bold leading-[32px] text-gray900">
              {item.title}
            </Text>
            {item.descLines.map((line) => (
              <Text
                key={line}
                className="mt-1 text-center text-[18px] leading-[22px] text-gray800"
              >
                {line}
              </Text>
            ))}
          </View>
        </View>
      </Pressable>
    ),
    [goNext],
  );

  const isLast = index >= LAST_INDEX;
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <View className="flex-1 bg-white">
      <Pressable
        className="absolute right-4 z-10 flex-row items-center"
        style={{ top: insets.top + 8 }}
        onPress={onComplete}
      >
        <Text className="text-[16px] text-gray700">건너뛰기</Text>
        <Ionicons name="chevron-forward" size={18} color={appColors.gray700} />
      </Pressable>

      <FlatList
        ref={listRef}
        data={DRIVE_ONBOARDING_SLIDES}
        keyExtractor={(item) => item.title}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        getItemLayout={(_, i) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * i,
          index: i,
        })}
      />

      <View className="flex-row items-center justify-center py-6">
        {DRIVE_ONBOARDING_SLIDES.map((_, i) => (
          <View
            key={i}
            className="mx-1 h-3 w-3 rounded-full"
            style={{ backgroundColor: i === index ? "#737373" : "#BEBEBE" }}
          />
        ))}
      </View>

      <View className="px-4" style={{ paddingBottom: bottomInset + 8 }}>
        <Pressable
          onPress={goNext}
          className="h-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: appColors.primary }}
        >
          <Text className="text-[16px] font-bold text-white">
            {isLast ? "운행일지 작성하러 가기" : "다음"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
