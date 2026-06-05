import { Image } from "expo-image";
import React, { memo } from "react";
import { Text, View } from "react-native";

import {
  ASSURANCE_INSPECTION_COMPLETE_BG,
  ASSURANCE_INSPECTION_COMPLETE_BORDER,
  ASSURANCE_INSPECTION_MAINTENANCE_BG,
  INSPECTION_COMPLETED_ICON_URL,
} from "@/src/features/products/assuranceInspection";

type Props = {
  isMaintenance: boolean;
};

export const AssuranceInspectionBadge = memo(function AssuranceInspectionBadge({
  isMaintenance,
}: Props) {
  if (isMaintenance) {
    return (
      <View
        className="mt-1 items-center justify-center rounded-lg px-2 py-[10px]"
        style={{ backgroundColor: ASSURANCE_INSPECTION_MAINTENANCE_BG }}
      >
        <Text className="text-center text-[14px] font-bold text-white">
          입고 점검중
        </Text>
      </View>
    );
  }

  return (
    <View
      className="mt-3 flex-row items-center justify-center gap-2 rounded-lg border px-2 py-3"
      style={{
        backgroundColor: ASSURANCE_INSPECTION_COMPLETE_BG,
        borderColor: ASSURANCE_INSPECTION_COMPLETE_BORDER,
      }}
    >
      <Image
        source={{ uri: INSPECTION_COMPLETED_ICON_URL }}
        style={{ width: 24, height: 24 }}
        contentFit="contain"
      />
      <Text className="text-[18px] font-bold text-gray900">입고 점검완료</Text>
    </View>
  );
});
