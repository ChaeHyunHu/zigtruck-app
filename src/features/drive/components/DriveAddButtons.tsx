import { Ionicons } from "@expo/vector-icons";
import React, { type Ref } from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type Props = {
  onPressLog: () => void;
  onPressFuel: () => void;
  onPressOther: () => void;
  logButtonRef?: Ref<View>;
  otherButtonRef?: Ref<View>;
};

export function DriveAddButtons({
  onPressLog,
  onPressFuel,
  onPressOther,
  logButtonRef,
  otherButtonRef,
}: Props) {
  return (
    <View className="flex-row gap-1.5 border-b border-gray300 bg-white px-4 py-2 shadow-sm">
      <Pressable
        ref={logButtonRef}
        collapsable={false}
        onPress={onPressLog}
        className="h-[34px] flex-1 flex-row items-center justify-center gap-1 rounded-full bg-[#E7EFFF]"
      >
        <Ionicons name="add" size={16} color={appColors.primary} />
        <Text className="text-[14px] font-semibold text-primary">일지</Text>
      </Pressable>
      <Pressable
        onPress={onPressFuel}
        className="h-[34px] flex-1 flex-row items-center justify-center gap-1 rounded-full border border-gray300 bg-gray100"
      >
        <Ionicons name="add" size={16} color={appColors.gray700} />
        <Text className="text-[14px] font-medium text-gray800">주유비</Text>
      </Pressable>
      <Pressable
        ref={otherButtonRef}
        collapsable={false}
        onPress={onPressOther}
        className="h-[34px] flex-1 flex-row items-center justify-center gap-1 rounded-full border border-gray300 bg-gray100"
      >
        <Ionicons name="add" size={16} color={appColors.gray700} />
        <Text className="text-[14px] font-medium text-gray800">기타내역</Text>
      </Pressable>
    </View>
  );
}
