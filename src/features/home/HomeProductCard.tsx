import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { ProductsListItem } from "@/src/features/home/types";
import { formatPrice } from "@/src/features/home/utils";
import {
  isAssuranceMaintenanceSale,
  isAssuranceProduct,
} from "@/src/features/products/assuranceInspection";
import { AssuranceInspectionBadge } from "@/src/features/products/AssuranceInspectionBadge";
import { ProductYoutubeIcon } from "@/src/features/products/ProductYoutubeIcon";
import {
  enumDesc,
  formatDistanceManKm,
  formatLoadedLength,
  formatPower,
  formatYearMonth,
  toText,
} from "@/src/features/products/utils";

type Props = {
  item: ProductsListItem;
  onPress: (id: number) => void;
  width?: number;
  imageHeight?: number;
  gap?: number;
  /** 검수 차량 등 — 흰 카드 + 그림자 + 파란 가격 스타일 */
  elevated?: boolean;
  /** false면 「입고 점검완료」 배지만 미표시 (입고 점검중은 유지) */
  showAssuranceInspectionCompleteBadge?: boolean;
};

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};

function formatDetailSpecs(item: ProductsListItem) {
  const parts = [
    formatYearMonth(item.firstRegistrationDate),
    item.transmission ? enumDesc(item.transmission) : undefined,
    formatDistanceManKm(item.distance),
    formatLoadedLength(item.loadedInnerLength),
    item.power ? formatPower(item.power) : undefined,
  ].filter((part): part is string => Boolean(part && part !== "-"));

  return parts.length > 0 ? parts.join(" · ") : "-";
}

function HomeProductCardComponent({
  item,
  onPress,
  width = 162,
  imageHeight = 112,
  gap = 10,
  elevated = false,
  showAssuranceInspectionCompleteBadge = true,
}: Props) {
  const isAssurance = isAssuranceProduct(item.salesType);
  const isMaintenance = isAssuranceMaintenanceSale(item.salesType, item.status);
  const showAssuranceInspection =
    isAssurance && (isMaintenance || showAssuranceInspectionCompleteBadge);
  const hasYoutube = Boolean(item.youtubeUrl?.trim());

  const specs = useMemo(
    () => formatDetailSpecs(item),
    [
      item.distance,
      item.firstRegistrationDate,
      item.loadedInnerLength,
      item.power,
      item.transmission,
    ],
  );

  if (elevated) {
    return (
      <Pressable
        style={{ width, marginRight: gap }}
        onPress={() => onPress(item.id)}
        className="active:opacity-95"
      >
        <View
          className="overflow-hidden rounded-2xl bg-white"
          style={CARD_SHADOW}
        >
          <View
            className="w-full overflow-hidden bg-gray200"
            style={{ height: imageHeight }}
          >
            <Image
              source={{ uri: item.representImageUrl || "" }}
              className="h-full w-full"
              contentFit="cover"
              transition={120}
            />
            {showAssuranceInspection ? (
              <View className="absolute left-2 top-2">
                <AssuranceInspectionBadge isMaintenance={isMaintenance} />
              </View>
            ) : null}
          </View>

          <View className="px-3 pb-3.5 pt-3">
            <View className="min-h-[40px] flex-row items-start">
              {hasYoutube ? <ProductYoutubeIcon size={20} /> : null}
              <Text
                numberOfLines={2}
                className="flex-1 text-[15px] font-bold leading-[20px] text-gray900"
              >
                {item.truckName || "차량 정보 없음"}
              </Text>
            </View>
            <Text
              numberOfLines={2}
              className="mt-1 text-[16px] leading-[17px] text-gray600"
            >
              {specs}
            </Text>
            <Text className="mt-2 text-[18px] font-bold leading-[24px] text-primary">
              {formatPrice(item.price)}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={{ width, marginRight: gap }}
      onPress={() => onPress(item.id)}
    >
      <View
        className="mb-2 w-full overflow-hidden rounded-[10px] bg-gray200"
        style={{ height: imageHeight }}
      >
        <Image
          source={{ uri: item.representImageUrl || "" }}
          className="h-full w-full"
          contentFit="cover"
          transition={120}
        />
        {item.productsNumber !== undefined ? (
          <View className="absolute bottom-2 left-2">
            <Text
              className="text-[11px] font-semibold text-white"
              style={{
                textShadowColor: "rgba(0,0,0,0.55)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              매물번호 {toText(item.productsNumber, "-")}
            </Text>
          </View>
        ) : null}
      </View>

      {showAssuranceInspection ? (
        <AssuranceInspectionBadge isMaintenance={isMaintenance} />
      ) : null}

      <View className="mb-1 min-h-9 flex-row items-start">
        {hasYoutube ? <ProductYoutubeIcon size={20} /> : null}
        <Text
          numberOfLines={2}
          className="flex-1 text-[14px] font-bold leading-[18px] text-gray900"
        >
          {item.truckName || "차량 정보 없음"}
        </Text>
      </View>
      <Text
        numberOfLines={2}
        className="mb-1.5 text-[12px] leading-4 text-gray600"
      >
        {specs}
      </Text>
      <Text className="text-[17px] font-bold text-gray900">
        {formatPrice(item.price)}
      </Text>
    </Pressable>
  );
}

export const HomeProductCard = React.memo(HomeProductCardComponent);
