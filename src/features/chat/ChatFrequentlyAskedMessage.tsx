import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

import type { ChatScenarioButton } from "./types";

type Props = {
  title: string;
  buttons: ChatScenarioButton[];
  timeLabel: string;
  onPressQuestion: (text: string) => void;
};

export function ChatFrequentlyAskedMessage({
  title,
  buttons,
  timeLabel,
  onPressQuestion,
}: Props) {
  return (
    <View className="my-1.5">
      <View className="flex-row rounded-[14px] bg-gray100 p-3.5">
        <Ionicons name="bulb-outline" size={18} color={appColors.gray700} />
        <Text className="ml-1 flex-1 text-[13px] font-medium leading-[17px] text-gray800">
          {title}
        </Text>
      </View>

      <View className="mt-1.5 flex-row items-end">
        <View className="overflow-hidden rounded-[14px] border border-gray300">
          {buttons.map((button, index) =>
            button.text ? (
              <Pressable
                key={`${button.text}-${index}`}
                onPress={() => onPressQuestion(button.text)}
                className={`px-3.5 py-3.5 ${index > 0 ? "border-t border-gray300" : ""}`}
              >
                <Text className="text-[13px] font-medium leading-[17px] text-primary">
                  {button.text}
                </Text>
              </Pressable>
            ) : null,
          )}
        </View>
        <Text className="ml-1.5 min-w-[56px] text-[12px] text-gray600">{timeLabel}</Text>
      </View>
    </View>
  );
}
