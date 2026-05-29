import { Image } from "expo-image";
import React, { memo } from "react";
import { View } from "react-native";

import { YOUTUBE_ICON_URL } from "@/src/features/products/assuranceInspection";

type Props = {
  size?: number;
};

export const ProductYoutubeIcon = memo(function ProductYoutubeIcon({
  size = 24,
}: Props) {
  return (
    <View style={{ width: size, height: size, marginRight: 8 }}>
      <Image
        source={{ uri: YOUTUBE_ICON_URL }}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    </View>
  );
});
