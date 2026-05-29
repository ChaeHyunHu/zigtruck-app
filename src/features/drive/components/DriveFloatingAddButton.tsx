import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  label: string;
  onPress: () => void;
};

export function DriveFloatingAddButton({ label, onPress }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="absolute left-0 right-0 items-center"
      style={{ bottom: insets.bottom + 16 }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        className="min-h-[48px] flex-row items-center gap-2 rounded-full bg-primary px-6 py-3 shadow-md"
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text className="text-[15px] font-bold text-white">{label}</Text>
      </Pressable>
    </View>
  );
}
