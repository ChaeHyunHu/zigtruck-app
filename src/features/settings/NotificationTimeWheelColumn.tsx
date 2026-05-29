import React, { useCallback, useEffect, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";

const ITEM_HEIGHT = 40;
const VISIBLE_HEIGHT = 100;

type Props = {
  items: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
};

export function NotificationTimeWheelColumn({
  items,
  selectedIndex,
  onChange,
  width = 84,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const isDragging = useRef(false);

  const scrollToIndex = useCallback((index: number, animated: boolean) => {
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated,
    });
  }, []);

  useEffect(() => {
    if (!isDragging.current) {
      scrollToIndex(selectedIndex, false);
    }
  }, [selectedIndex, scrollToIndex]);

  const settleOffset = useCallback(
    (offsetY: number) => {
      const index = Math.max(0, Math.min(items.length - 1, Math.round(offsetY / ITEM_HEIGHT)));
      scrollToIndex(index, true);
      onChange(index);
      return index;
    },
    [items.length, onChange, scrollToIndex, selectedIndex],
  );

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isDragging.current = false;
      settleOffset(event.nativeEvent.contentOffset.y);
    },
    [settleOffset],
  );

  return (
    <View style={{ width, height: VISIBLE_HEIGHT }} className="relative">
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 z-10 border-y-2 border-gray700"
        style={{ top: (VISIBLE_HEIGHT - ITEM_HEIGHT) / 2, height: ITEM_HEIGHT }}
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={() => {
          isDragging.current = true;
        }}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        contentContainerStyle={{
          paddingVertical: (VISIBLE_HEIGHT - ITEM_HEIGHT) / 2,
        }}
      >
        {items.map((label, index) => {
          const isSelected = index === selectedIndex;
          return (
            <View
              key={`${label}-${index}`}
              style={{ height: ITEM_HEIGHT, width }}
              className="items-center justify-center"
            >
              <Text
                className={`text-center ${
                  isSelected ? "text-[20px] font-medium text-gray800" : "text-[16px] text-gray600"
                }`}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const NOTIFICATION_TIME_WHEEL_ITEM_HEIGHT = ITEM_HEIGHT;
