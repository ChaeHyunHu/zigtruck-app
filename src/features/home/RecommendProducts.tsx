import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from "react-native";

import { appColors } from "@/src/constants/colors";
import { toText } from "@/src/features/products/utils";

import { ProductsListItem } from "./types";
import {
  formatDistanceToThousandKm,
  formatPrice,
  formatShortYear,
} from "./utils";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PAGE_WIDTH = SCREEN_WIDTH;

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

type Props = {
  products: ProductsListItem[];
  onPressProduct: (id: number) => void;
};

type RecommendProductRowProps = {
  item: ProductsListItem;
  onPress: (id: number) => void;
};

function RecommendProductRow({ item, onPress }: RecommendProductRowProps) {
  const registrationYear = item.firstRegistrationDate?.split("-")?.[0];
  const registrationMonth = item.firstRegistrationDate?.split("-")?.[1];

  return (
    <Pressable onPress={() => onPress(item.id)} className="mb-4 flex-row">
      <View className="relative h-[116px] w-[154px] overflow-hidden rounded-lg bg-gray200">
        <Image
          source={{ uri: item.representImageUrl || "" }}
          className="h-full w-full"
          contentFit="cover"
          transition={120}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
          className="absolute bottom-0 left-0 right-0 h-10"
        />
        <Text className="absolute bottom-2 left-2.5 text-[14px] font-medium text-white">
          매물번호 {toText(item.productsNumber, "-")}
        </Text>
      </View>
      <View className="ml-3 flex-1 justify-between py-0.5">
        <View>
          <Text
            numberOfLines={2}
            className="text-[14px] font-semibold leading-[17px] text-gray800"
          >
            {item.truckName || "차량 정보 없음"}
          </Text>
          <Text
            numberOfLines={2}
            className="mt-1 text-[12px] leading-[15px] text-gray600"
          >
            {formatShortYear(registrationYear)}/{registrationMonth || "-"}식 ·{" "}
            {formatDistanceToThousandKm(item.distance)}만km ·{" "}
            {item.loadedInnerLength ?? "-"}m
          </Text>
        </View>
        {item.price ? (
          <Text className="text-[18px] font-semibold text-gray900">
            {formatPrice(item.price)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function RecommendProducts({ products, onPressProduct }: Props) {
  const groupedProducts = useMemo(
    () => chunk(products.slice(0, 12), 3),
    [products],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<ProductsListItem[]>>(null);
  const showPager = groupedProducts.length > 1;

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / PAGE_WIDTH,
      );
      setActiveIndex(nextIndex);
    },
    [],
  );

  const onPressBullet = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  }, []);

  const renderPage = useCallback(
    ({ item: group }: { item: ProductsListItem[] }) => (
      <View style={{ width: PAGE_WIDTH }} className="px-4 py-5">
        {group.map((product) => (
          <RecommendProductRow
            key={product.id}
            item={product}
            onPress={onPressProduct}
          />
        ))}
      </View>
    ),
    [onPressProduct],
  );

  if (!products.length) return null;

  return (
    <View className="mt-[10px] bg-white py-[14px]">
      <Text className="px-4 text-[20px] font-bold text-gray800">
        회원님의 맞춤차량
      </Text>

      {showPager ? (
        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          data={groupedProducts}
          keyExtractor={(_, index) => `recommend-page-${index}`}
          renderItem={renderPage}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: PAGE_WIDTH,
            offset: PAGE_WIDTH * index,
            index,
          })}
        />
      ) : (
        <View className="px-4 py-5">
          {groupedProducts[0]?.map((product) => (
            <RecommendProductRow
              key={product.id}
              item={product}
              onPress={onPressProduct}
            />
          ))}
        </View>
      )}

      {showPager ? (
        <View className="flex-row items-center justify-center">
          {groupedProducts.map((_, index) => (
            <Pressable
              key={`bullet-${index}`}
              onPress={() => onPressBullet(index)}
              hitSlop={8}
              className="m-[3px] h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  index === activeIndex ? appColors.primary : appColors.gray400,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
