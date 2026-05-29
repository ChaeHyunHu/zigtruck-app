import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

export type GuideTabItem = {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  tabs: GuideTabItem[];
  value: number;
  onChange: (index: number) => void;
};

export function GuideTabBar({ tabs, value, onChange }: Props) {
  return (
    <View className="border-b border-gray300 bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {tabs.map((tab, index) => {
          const active = value === index;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(index)}
              className="min-w-[72px] flex-1 items-center px-2 py-3"
              style={{
                borderBottomWidth: 2,
                borderBottomColor: active ? appColors.gray900 : "transparent",
              }}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={active ? appColors.gray900 : appColors.gray600}
              />
              <Text
                className={`mt-1 text-center text-[14px] ${
                  active ? "font-semibold text-gray900" : "text-gray600"
                }`}
                numberOfLines={1}
              >
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
