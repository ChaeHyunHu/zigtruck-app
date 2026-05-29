import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import { BasicButton } from "@/src/components/common/BasicButton";
import { appColors } from "@/src/constants/colors";
import { IMAGE_BASE_URL } from "@/src/constants/url";
import { formatPrice } from "@/src/features/home/utils";

import type { InterestProductItem } from "./types";
import { enumCode, getSalesTypeLabel } from "./utils";

const FALLBACK_IMAGE = `${IMAGE_BASE_URL}/car_none.png`;

type InterestProductCardProps = {
  item: InterestProductItem;
  isLiked: boolean;
  buttonLabel: string;
  buttonDisabled?: boolean;
  onPressCard?: () => void;
  onToggleLike: () => void;
  onPressAction: () => void;
};

function StatusBadge({ statusCode, statusDesc }: { statusCode?: string; statusDesc?: string }) {
  const isSale = statusCode === "SALE" || statusCode === "MAINTENANCE_SALE";
  return (
    <View
      className={`rounded-lg px-2 py-1 ${isSale ? "border border-primary bg-gray100" : "bg-gray100"}`}
    >
      <Text
        className={`text-[14px] font-semibold ${isSale ? "text-primary" : "text-gray600"}`}
      >
        {statusDesc ?? "-"}
      </Text>
    </View>
  );
}

export const InterestProductCard = memo(function InterestProductCard({
  item,
  isLiked,
  buttonLabel,
  buttonDisabled,
  onPressCard,
  onToggleLike,
  onPressAction,
}: InterestProductCardProps) {
  const statusCode = enumCode(item.status);
  const statusDesc =
    typeof item.status === "object" ? item.status?.desc : undefined;
  const salesTypeCode = enumCode(item.salesType);
  const salesTypeLabel = getSalesTypeLabel(salesTypeCode);

  const handleToggleLike = useCallback(
    (event?: { stopPropagation?: () => void }) => {
      event?.stopPropagation?.();
      onToggleLike();
    },
    [onToggleLike],
  );

  return (
    <View className="mt-3 rounded-[10px] border border-gray300 bg-white">
      <Pressable
        className="flex-row px-4 pt-4"
        onPress={onPressCard}
        disabled={!onPressCard}
      >
        <Image
          source={{ uri: item.representImageUrl || FALLBACK_IMAGE }}
          className="h-[100px] w-[100px] rounded-lg bg-gray200"
          contentFit="cover"
        />
        <View className="relative ml-3 flex-1">
          <View className="flex-row flex-wrap gap-[6px] pr-8">
            <StatusBadge statusCode={statusCode} statusDesc={statusDesc} />
            {salesTypeLabel ? (
              <View className="rounded-lg bg-[#f0faf4] px-2 py-1">
                <Text className="text-[14px] font-semibold text-[#00a86b]">
                  {salesTypeLabel}
                </Text>
              </View>
            ) : null}
          </View>
          <Pressable
            className="absolute right-0 top-0 p-1"
            onPress={() => handleToggleLike()}
            hitSlop={8}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#FF4D4F" : appColors.gray700}
            />
          </Pressable>
          <Text className="mt-2 text-[16px] font-medium text-gray800" numberOfLines={2}>
            {item.truckName}
          </Text>
          <Text className="text-[18px] font-semibold text-gray800">
            {formatPrice(typeof item.price === "string" ? Number(item.price) : item.price)}
          </Text>
        </View>
      </Pressable>
      <View className="p-4" style={{ opacity: buttonDisabled ? 0.5 : 1 }}>
        <BasicButton
          name={buttonLabel}
          bgColor="#ffffff"
          borderColor={appColors.gray300}
          textColor={appColors.gray600}
          onClick={buttonDisabled ? () => undefined : onPressAction}
        />
      </View>
    </View>
  );
});
