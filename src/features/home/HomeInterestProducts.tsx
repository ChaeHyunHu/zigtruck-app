import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { HomeProductCard } from "@/src/features/home/HomeProductCard";
import type { ProductsListItem } from "@/src/features/home/types";
import type { InterestProductItem } from "@/src/features/interest-products/types";

const CARD_WIDTH = 154;
const CARD_IMAGE_HEIGHT = 116;
const CARD_GAP = 8;

function toHomeListItem(item: InterestProductItem): ProductsListItem {
  return {
    id: item.productId,
    productsNumber: item.productsNumber,
    representImageUrl: item.representImageUrl,
    truckName: item.truckName,
    firstRegistrationDate: item.firstRegistrationDate ?? item.year,
    distance:
      typeof item.distance === "number"
        ? item.distance
        : Number(item.distance) || undefined,
    loadedInnerLength: item.loadedInnerLength,
    transmission: item.transmission,
    power: item.power,
    price: typeof item.price === "string" ? Number(item.price) : item.price,
  };
}

type HomeInterestProductsProps = {
  products: InterestProductItem[];
  onPressProduct: (productId: number) => void;
};

export function HomeInterestProducts({
  products,
  onPressProduct,
}: HomeInterestProductsProps) {
  const onPressHeader = useCallback(() => {
    router.push("/interest");
  }, []);

  if (products.length === 0) return null;

  return (
    <View className="mt-[10px] bg-white pb-4 pt-[10px]">
      <Pressable
        className="mb-2 flex-row items-center justify-between px-4"
        onPress={onPressHeader}
      >
        <Text className="text-[20px] font-semibold text-gray800">찜한 차량</Text>
        <Ionicons name="chevron-forward" size={24} color={appColors.gray600} />
      </Pressable>
      <FlatList
        horizontal
        data={products}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
        renderItem={({ item }) => (
          <HomeProductCard
            item={toHomeListItem(item)}
            onPress={onPressProduct}
            width={CARD_WIDTH}
            imageHeight={CARD_IMAGE_HEIGHT}
            gap={CARD_GAP}
          />
        )}
      />
    </View>
  );
}
