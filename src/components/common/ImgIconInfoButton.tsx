import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

type ImgIconInfoButtonProps = {
  onPress: () => void;
  imageUri: string;
  subtitle?: string;
  mainTitle: string;
  description?: string;
};

export function ImgIconInfoButton({
  onPress,
  imageUri,
  subtitle,
  mainTitle,
  description,
}: ImgIconInfoButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[106px] w-full flex-row items-center gap-5 rounded-xl border border-gray300 bg-gray100 p-[18px]"
    >
      <Image
        source={{ uri: imageUri }}
        style={{ width: 52, height: 52 }}
        contentFit="contain"
      />
      <View className="flex-1 gap-1">
        {subtitle ? (
          <Text className="text-[14px] leading-5 text-gray800">{subtitle}</Text>
        ) : null}
        <Text className="text-[18px] font-bold leading-[22px] text-gray800">
          {mainTitle}
        </Text>
        {description ? (
          <Text className="text-[14px] leading-5 text-gray800">{description}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
